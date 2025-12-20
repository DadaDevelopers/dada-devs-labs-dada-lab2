package com.dada_labs_two.chamavault.project_commons.roles.services;

import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import com.dada_labs_two.chamavault.project_commons.roles.repositories.RolesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RolesRepository rolesRepository;

    public Optional<Roles> findRoleByName(String roleName) {
        return rolesRepository.findById(roleName.toUpperCase());
    }

    public Roles addRole(String role) {
        Optional<Roles> optionalRole = findRoleByName(role);
        return optionalRole.orElseGet(() -> rolesRepository.save(new Roles(role.toUpperCase())));
    }

    public Page<Roles> findAllRoles(Pageable pageable) {
        return rolesRepository.findAll(pageable);
    }

    public void deleteRole(String role) {
        rolesRepository.deleteById(role.toUpperCase());
    }
}
