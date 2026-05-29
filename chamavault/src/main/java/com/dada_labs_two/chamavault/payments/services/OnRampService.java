package com.dada_labs_two.chamavault.payments.services;

import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.payments.dtos.FundWalletByMpesa;
import com.dada_labs_two.chamavault.payments.dtos.OnrampResponseDTO;
import com.dada_labs_two.chamavault.payments.exchange.onramp.bitika.services.BitikaClient;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InvalidObjectException;

@Service
@RequiredArgsConstructor
public class OnRampService {
    private final WalletRepository walletRepository;
    private final BitikaClient bitikaClient;
    private final LightningWalletService lightningWalletService;

    public OnrampResponseDTO triggerOnrampViaMpesa(FundWalletByMpesa request) throws InvalidObjectException {
        //validate phone
        String phoneNumber = request.phoneNumber();
        if (phoneNumber == null || phoneNumber.length() != 10)
            throw new InvalidObjectException("invalid phone number");
        
        //create invoice
        Wallet wallet = walletRepository.findById(request.walletId())
                .orElseThrow(() -> new InvalidObjectException("invalid wallet id"));
        String invoice =
                lightningWalletService.createInvoice(
                        wallet.getLightning().get("inkey"),
                        request.amountSats(),
                        "Buy sats via mpesa"
                );
        var response = bitikaClient.buySats(invoice, request.phoneNumber());

        return  new OnrampResponseDTO("Request successfully dispatched","0000", response);
    }
}
