package com.dada_labs_two.chamavault.lightning.controllers;

import com.dada_labs_two.chamavault.lightning.services.CustodyMigrationService;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/custody-migrations")
@RequiredArgsConstructor
public class CustodyMigrationController {
    private final CustodyMigrationService service;

    @PostMapping
    public CustodyMigrationService.MigrationView prepare(@RequestBody PrepareMigrationRequest request,
                                                         @AuthenticationPrincipal User admin) {
        return service.prepare(request.walletReferences(), admin);
    }

    @GetMapping("/{reference}")
    public CustodyMigrationService.MigrationView get(@PathVariable UUID reference,
                                                     @AuthenticationPrincipal User admin) {
        return service.get(reference, admin);
    }

    @PostMapping("/{reference}/refresh-funding")
    public CustodyMigrationService.MigrationView refreshFunding(@PathVariable UUID reference,
                                                                @AuthenticationPrincipal User admin) {
        return service.refreshFunding(reference, admin);
    }

    @PostMapping("/{reference}/finalize")
    public CustodyMigrationService.MigrationView finalizeMigration(@PathVariable UUID reference,
                                                                   @AuthenticationPrincipal User admin) {
        return service.finalizeMigration(reference, admin);
    }

    @PostMapping("/{reference}/cancel")
    public CustodyMigrationService.MigrationView cancel(@PathVariable UUID reference,
                                                        @AuthenticationPrincipal User admin) {
        return service.cancel(reference, admin);
    }

    public record PrepareMigrationRequest(Collection<UUID> walletReferences) {}
}
