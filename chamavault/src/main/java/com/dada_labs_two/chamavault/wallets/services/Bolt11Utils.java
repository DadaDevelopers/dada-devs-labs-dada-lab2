package com.dada_labs_two.chamavault.wallets.services;

import fr.acinq.lightning.MilliSatoshi;
import fr.acinq.lightning.payment.Bolt11Invoice;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Optional;

/**
 * Utility helpers for parsing BOLT11 Lightning invoices.
 */
public class Bolt11Utils {

    private Bolt11Utils() {}

    private static Bolt11Invoice parse(String bolt11) {
        return Bolt11Invoice.Companion.read(bolt11).get();
    }

    /* -------------------------------------------------
     * Extract payment hash
     * ------------------------------------------------- */
    public static String extractPaymentHash(String bolt11) {
        Bolt11Invoice invoice = parse(bolt11);
        return invoice.getPaymentHash().toString();
    }

    /* -------------------------------------------------
     * Extract amount in millisats
     * ------------------------------------------------- */
    public static long extractAmountMsats(String bolt11) {
        MilliSatoshi amount = parse(bolt11).getAmount();
        if (amount == null) {
            throw new IllegalArgumentException("Invoice has no amount");
        }
        return amount.toLong();
    }

    /* -------------------------------------------------
     * Extract amount in sats
     * ------------------------------------------------- */
    public static long extractAmountSats(String bolt11) {
        return extractAmountMsats(bolt11) / 1_000;
    }

    /* -------------------------------------------------
     * Extract expiry timestamp
     * ------------------------------------------------- */
    public static ZonedDateTime extractExpiry(String bolt11) {
        Bolt11Invoice invoice = parse(bolt11);

        long timestamp = invoice.getTimestampSeconds();

        Long expiry = invoice.getExpirySeconds();
        long expirySeconds = (expiry != null) ? expiry : 3600L;

        return ZonedDateTime.ofInstant(
                Instant.ofEpochSecond(timestamp + expirySeconds),
                ZoneOffset.UTC
        );
    }

    /* -------------------------------------------------
     * Extract description / memo
     * ------------------------------------------------- */
    public static Optional<String> extractDescription(String bolt11) {
        return Optional.ofNullable(parse(bolt11).getDescription());
    }

    /* -------------------------------------------------
     * Network detection (mainnet / testnet / regtest)
     * ------------------------------------------------- */
    public static String detectNetwork(String bolt11) {
        return parse(bolt11).getPrefix();
        // lnbc   = mainnet
        // lntb   = testnet
        // lnbcrt = regtest
    }
}
