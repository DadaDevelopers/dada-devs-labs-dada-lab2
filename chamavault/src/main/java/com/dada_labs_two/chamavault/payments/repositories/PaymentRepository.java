package com.dada_labs_two.chamavault.payments.repositories;

import com.dada_labs_two.chamavault.payments.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
}
