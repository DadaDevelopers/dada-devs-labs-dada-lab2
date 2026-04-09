package com.dada_labs_two.chamavault.payments.services;

import com.dada_labs_two.chamavault.payments.constants.PaymentCategory;
import com.dada_labs_two.chamavault.payments.constants.PaymentProvider;
import com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.services.PaystackClient;
import com.dada_labs_two.chamavault.payments.models.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentsRouteService {
    private final PaystackClient paystackClient;

    public Payment routePaymentsToProviders(Payment payment) throws Exception {
        if (payment.getProvider().equals(PaymentProvider.PAYSTACK) && payment.getCategory().equals(PaymentCategory.COLLECTIONS)) {
            log.info("routing payment to paystack");
            return paystackClient.initializeTransaction(payment);
        } else {
            throw new RuntimeException("No such payment route configured");
        }
    }
}
