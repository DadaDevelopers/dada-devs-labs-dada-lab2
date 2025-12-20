package com.dada_labs_two.chamavault.project_commons.roles.controllers;

import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import com.dada_labs_two.chamavault.project_commons.roles.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/commons/roles")
@RequiredArgsConstructor
public class RolesController {
    private static  final String ROLE = "/{role}";

    private final RoleService roleService;

    @PostMapping(ROLE)
    public ResponseEntity<Roles> createRole(@PathVariable String role) {
        return new ResponseEntity<>(roleService.addRole(role), HttpStatus.OK);
    }

    @DeleteMapping(ROLE)
    public ResponseEntity<String> deleteRole(@PathVariable String role) {
        roleService.deleteRole(role);
        return new ResponseEntity<>("Role deleted successfully", HttpStatus.OK);
    }

    @GetMapping(ROLE)
    public ResponseEntity<Optional<Roles>> getRoles(@PathVariable String role) {
        return new ResponseEntity<>(roleService.findRoleByName(role), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<Roles>> getAllRoles(Pageable pageable) {
        return new ResponseEntity<>(roleService.findAllRoles(pageable), HttpStatus.OK);
    }
}
