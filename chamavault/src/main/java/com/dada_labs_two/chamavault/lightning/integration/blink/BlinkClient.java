package com.dada_labs_two.chamavault.lightning.integration.blink;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import com.dada_labs_two.chamavault.wallets.services.Bolt11Utils;
import tools.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * Thin adapter around Blink's public GraphQL API.
 *
 * Blink has one BTC wallet per authenticated account rather than LNbits-style
 * application sub-wallets. ChamaVault therefore stores virtual-wallet balances
 * in its own ledger and uses the configured Blink BTC wallet only for external
 * Lightning settlement.
 */
@Component
@Slf4j
public class BlinkClient {
    public static final String REFERENCE_PREFIX = "blink:";

    private final WebClient webClient;
    private final String apiKey;
    private final String configuredBtcWalletId;
    private final int invoiceExpiryMinutes;
    private final boolean paymentsEnabled;
    private final long maxPaymentSats;
    private volatile String discoveredBtcWalletId;

    public BlinkClient(@Value("${blink.base-url:https://api.blink.sv/graphql}") String baseUrl,
                       @Value("${blink.api-key:}") String apiKey,
                       @Value("${blink.btc-wallet-id:}") String btcWalletId,
                       @Value("${blink.invoice-expiry-minutes:60}") int invoiceExpiryMinutes,
                       @Value("${blink.payments-enabled:false}") boolean paymentsEnabled,
                       @Value("${blink.max-payment-sats:1000000}") long maxPaymentSats) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.configuredBtcWalletId = btcWalletId == null ? "" : btcWalletId.trim();
        this.invoiceExpiryMinutes = invoiceExpiryMinutes;
        this.paymentsEnabled = paymentsEnabled;
        this.maxPaymentSats = maxPaymentSats;
    }

    public WalletResponse createVirtualWallet(String name) {
        String virtualId = REFERENCE_PREFIX + UUID.randomUUID();
        // Keys are opaque routing references, never Blink credentials.
        return new WalletResponse(virtualId, name, virtualId, virtualId,
                "omnibus", virtualId, btcWalletId(), "BTC", "0");
    }

    public WalletDetails backingWallet() {
        JsonNode data = execute("""
                query Me {
                  me { defaultAccount { wallets { id walletCurrency balance } } }
                }
                """, Map.of());
        JsonNode wallet = findBtcWallet(data.path("me").path("defaultAccount").path("wallets"));
        return new WalletDetails(wallet.path("id").asText(), "Blink BTC omnibus wallet",
                Math.multiplyExact(wallet.path("balance").asLong(), 1_000L));
    }

    public InvoiceResponse createInvoice(long amountSats, String memo) {
        JsonNode data = execute("""
                mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
                  lnInvoiceCreate(input: $input) {
                    invoice { paymentRequest paymentHash satoshis }
                    errors { message path code }
                  }
                }
                """, Map.of("input", Map.of(
                "walletId", btcWalletId(),
                "amount", amountSats,
                "memo", memo == null ? "" : memo,
                "expiresIn", invoiceExpiryMinutes
        )));
        JsonNode payload = data.path("lnInvoiceCreate");
        ensureNoPayloadErrors("create invoice", payload);
        JsonNode invoice = requireObject(payload, "invoice", "Blink returned no invoice");
        String paymentRequest = requiredText(invoice, "paymentRequest");
        String paymentHash = requiredText(invoice, "paymentHash");
        return new InvoiceResponse(paymentHash, paymentRequest, false, paymentRequest,
                paymentHash, invoice.path("satoshis").asLong(amountSats),
                Math.multiplyExact(amountSats, 1_000L), null, null);
    }

    public PayInvoiceResponse payInvoice(String paymentRequest) {
        if (!paymentsEnabled) {
            throw new IllegalStateException("Blink outgoing payments are disabled; set blink.payments-enabled=true after validating controls");
        }
        if (maxPaymentSats > 0) {
            long amountSats = Bolt11Utils.extractAmountSats(paymentRequest);
            if (amountSats > maxPaymentSats) {
                throw new IllegalArgumentException("Blink payment exceeds configured maximum of " + maxPaymentSats + " sats");
            }
        }
        JsonNode data = execute("""
                mutation LnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
                  lnInvoicePaymentSend(input: $input) {
                    status
                    transaction {
                      initiationVia { ... on InitiationViaLn { paymentHash paymentRequest } }
                      settlementVia {
                        ... on SettlementViaLn { preImage }
                        ... on SettlementViaIntraLedger { preImage }
                      }
                    }
                    errors { message path code }
                  }
                }
                """, Map.of("input", Map.of(
                "walletId", btcWalletId(),
                "paymentRequest", paymentRequest
        )));
        JsonNode payload = data.path("lnInvoicePaymentSend");
        ensureNoPayloadErrors("pay invoice", payload);
        String status = payload.path("status").asText("").toUpperCase(Locale.ROOT);
        if ("FAILURE".equals(status)) {
            throw new IllegalStateException("Blink payment failed");
        }
        JsonNode transaction = payload.path("transaction");
        String hash = transaction.path("initiationVia").path("paymentHash").asText(null);
        if (hash == null || hash.isBlank()) hash = Bolt11Utils.extractPaymentHash(paymentRequest);
        String preimage = transaction.path("settlementVia").path("preImage").asText(null);
        boolean paid = "SUCCESS".equals(status) || "ALREADY_PAID".equals(status);
        return new PayInvoiceResponse(hash, hash, paid, preimage);
    }

    public PaymentStatus getPayment(String paymentHash) {
        JsonNode data = execute("""
                query LnInvoicePaymentStatusByHash($input: LnInvoicePaymentStatusByHashInput!) {
                  lnInvoicePaymentStatusByHash(input: $input) {
                    paymentHash paymentPreimage paymentRequest status
                  }
                }
                """, Map.of("input", Map.of("paymentHash", paymentHash)));
        JsonNode result = data.path("lnInvoicePaymentStatusByHash");
        if (result.isMissingNode() || result.isNull()) {
            throw new IllegalStateException("Blink returned no payment status for " + paymentHash);
        }
        String blinkStatus = result.path("status").asText("PENDING").toUpperCase(Locale.ROOT);
        boolean paid = "PAID".equals(blinkStatus) || "SUCCESS".equals(blinkStatus);
        String normalized = switch (blinkStatus) {
            case "PAID", "SUCCESS" -> "success";
            case "EXPIRED", "FAILURE", "FAILED" -> "failed";
            default -> "pending";
        };
        PaymentDetailsDTO details = PaymentDetailsDTO.builder()
                .checkingId(paymentHash)
                .paymentHash(result.path("paymentHash").asText(paymentHash))
                .walletId(btcWalletId())
                .status(normalized)
                .preimage(result.path("paymentPreimage").asText(null))
                .paymentRequest(result.path("paymentRequest").asText(null))
                .build();
        return new PaymentStatus(paid, normalized, details.getPreimage(), details,
                details.getPaymentHash(), null, null, null, null,
                details.getPaymentRequest(), null);
    }

    public PaymentFees getPaymentFees(String paymentHash) {
        JsonNode data = execute("""
                query TransactionsByPaymentHash($paymentHash: PaymentHash!) {
                  me { defaultAccount { wallets {
                    id walletCurrency
                    transactionsByPaymentHash(paymentHash: $paymentHash) {
                      direction status settlementCurrency settlementFee
                    }
                  } } }
                }
                """, Map.of("paymentHash", paymentHash));
        JsonNode wallet = findBtcWallet(data.path("me").path("defaultAccount").path("wallets"));
        JsonNode transactions = wallet.path("transactionsByPaymentHash");
        if (!transactions.isArray()) throw new IllegalStateException("Blink returned no transactions");
        for (JsonNode transaction : transactions) {
            if ("SEND".equalsIgnoreCase(transaction.path("direction").asText()) &&
                    "SUCCESS".equalsIgnoreCase(transaction.path("status").asText())) {
                long feeSats = Math.abs(transaction.path("settlementFee").asLong());
                return new PaymentFees(feeSats, Math.multiplyExact(feeSats, 1_000L));
            }
        }
        throw new IllegalStateException("Blink payment fees not available yet");
    }

    /** Aggregate Blink transactions cannot be assigned to every virtual wallet. */
    public List<PaymentStatus> listPayments() {
        return List.of();
    }

    private String btcWalletId() {
        if (!configuredBtcWalletId.isBlank()) return configuredBtcWalletId;
        if (discoveredBtcWalletId == null) discoveredBtcWalletId = backingWallet().id();
        return discoveredBtcWalletId;
    }

    private JsonNode execute(String query, Map<String, ?> variables) {
        if (apiKey.isBlank()) throw new IllegalStateException("blink.api-key is required");
        JsonNode root = webClient.post()
                .header("X-API-KEY", apiKey)
                .bodyValue(Map.of("query", query, "variables", variables))
                .retrieve()
                .onStatus(status -> status.isError(), response -> response.bodyToMono(String.class)
                        .map(body -> new RuntimeException("Blink HTTP error: " + body)))
                .bodyToMono(JsonNode.class)
                .block();
        if (root == null) throw new IllegalStateException("Blink returned an empty response");
        JsonNode errors = root.path("errors");
        if (errors.isArray() && !errors.isEmpty()) {
            throw new IllegalStateException("Blink GraphQL error: " + errorMessages(errors));
        }
        JsonNode data = root.path("data");
        if (!data.isObject()) throw new IllegalStateException("Blink returned no data");
        return data;
    }

    private void ensureNoPayloadErrors(String operation, JsonNode payload) {
        JsonNode errors = payload.path("errors");
        if (errors.isArray() && !errors.isEmpty()) {
            throw new IllegalStateException("Blink failed to " + operation + ": " + errorMessages(errors));
        }
    }

    private String errorMessages(JsonNode errors) {
        List<String> messages = new ArrayList<>();
        errors.forEach(error -> messages.add(error.path("message").asText(error.toString())));
        return String.join("; ", messages);
    }

    private JsonNode findBtcWallet(JsonNode wallets) {
        if (wallets.isArray()) {
            for (JsonNode wallet : wallets) {
                if ("BTC".equalsIgnoreCase(wallet.path("walletCurrency").asText()) &&
                        (configuredBtcWalletId.isBlank() || configuredBtcWalletId.equals(wallet.path("id").asText()))) {
                    return wallet;
                }
            }
        }
        throw new IllegalStateException("Blink BTC wallet not found");
    }

    private JsonNode requireObject(JsonNode parent, String field, String message) {
        JsonNode value = parent.path(field);
        if (!value.isObject()) throw new IllegalStateException(message);
        return value;
    }

    private String requiredText(JsonNode node, String field) {
        String value = node.path(field).asText(null);
        if (value == null || value.isBlank()) throw new IllegalStateException("Blink returned no " + field);
        return value;
    }
}
