package com.dada_labs_two.chamavault.payments.services;

import com.dada_labs_two.chamavault.payments.constants.*;
import com.dada_labs_two.chamavault.payments.dtos.CreateTransactionDTO;
import com.dada_labs_two.chamavault.payments.models.Payment;
import com.dada_labs_two.chamavault.payments.repositories.PaymentRepository;
import com.dada_labs_two.chamavault.project_commons.countries.services.CountryService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.wallets.constants.*;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final CountryService countryService;
    private final PaymentsRouteService paymentsRouteService;

    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    //process payments
    //when payment request is received
    //      step 0: create  a transaction object and save
    //      step 1: check to confirm the picked provider
    //      step 2. save the payment with status ENROUTE
    //      step 3: if provider exists in the system, route the payment to the provider integration client
    //      step 4: save the results with new payment status either processing, terminated, failed or complete, discarded
    public Payment initiatePaymentProcessing(CreateTransactionDTO createTransactionDTO) throws Exception {
        log.info("initiate payment processing request: {}", createTransactionDTO);

        if (createTransactionDTO.amount().compareTo(BigDecimal.ZERO) <= 0)
            throw new  IllegalArgumentException("Amount must be greater than zero");

        User recipient = userRepository.findById(createTransactionDTO.userId()).orElseThrow();
        String email = "chamavault.support@gmail.com";
        if (recipient.getKyc() != null && (!recipient.getKyc().isEmpty()) && !(recipient.getKyc().get("email").isBlank()))
            email = recipient.getKyc().get("email");
        //0
        Payment payment = Payment.builder()
                .amount(createTransactionDTO.amount())
                .accountNumber(email)
                .description(createTransactionDTO.description())
                .mode(PaymentMode.LINK)
                .provider(createTransactionDTO.paymentProvider())
                .category(PaymentCategory.COLLECTIONS)
                .walletAffiliatedNetwork(Network.FIAT)
                .country(countryService.findByCountryCode("KE").orElseThrow())
                .currency(Currencies.KES)
                .transactionStatus(TransactionStatus.CREATED)
                .createdBy(recipient.getUsername())
                .metadata(new HashMap<>() {{ put("walletId", createTransactionDTO.walletId().toString()); }})
                .build();
        payment =  paymentRepository.save(payment);

        //route
        payment = paymentsRouteService.routePaymentsToProviders(payment);
        payment =  paymentRepository.save(payment);

        return payment;
    }
}
