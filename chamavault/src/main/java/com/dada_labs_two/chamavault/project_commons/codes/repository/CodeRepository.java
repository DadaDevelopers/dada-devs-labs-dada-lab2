package com.dada_labs_two.chamavault.project_commons.codes.repository;

import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.users.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, String>,
        JpaSpecificationExecutor<Code> {
    Optional<Code> findByCodeAndOwnerAndActiveTrue(String code, User owner);
    Optional<Code> findByCodeAndActiveTrue(String code);
}
