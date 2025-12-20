package com.dada_labs_two.chamavault.project_commons.roles.repositories;

import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RolesRepository extends JpaRepository<Roles, String>, JpaSpecificationExecutor<Roles> {
}
