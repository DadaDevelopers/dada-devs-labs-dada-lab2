package com.dada_labs_two.chamavault.contributions.repositories;
import com.dada_labs_two.chamavault.contributions.models.ObligationPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface ObligationPaymentRepository extends JpaRepository<ObligationPayment, UUID> {}
