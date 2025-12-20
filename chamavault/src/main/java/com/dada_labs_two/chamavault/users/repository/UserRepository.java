package com.dada_labs_two.chamavault.users.repository;

import com.dada_labs_two.chamavault.users.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMsisdn(String msisdn);
    Optional<User> findByReferralCode(String referralCode);
}
