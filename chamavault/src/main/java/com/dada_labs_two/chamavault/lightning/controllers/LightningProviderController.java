package com.dada_labs_two.chamavault.lightning.controllers;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import com.dada_labs_two.chamavault.lightning.models.LightningProviderConfig;
import com.dada_labs_two.chamavault.lightning.services.LightningProviderConfigService;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/lightning-provider")
@RequiredArgsConstructor
public class LightningProviderController {
    private final LightningProviderConfigService service;

    @GetMapping
    public Map<String, String> current(@AuthenticationPrincipal User user) {
        // Use the same authorization check as mutation without changing state.
        assertAdmin(user);
        return Map.of("activeProvider", service.activeProvider().name());
    }

    @PutMapping
    public LightningProviderConfig switchProvider(@RequestBody SwitchProviderRequest request,
                                                   @AuthenticationPrincipal User user) {
        return service.switchProvider(request.provider(), user);
    }

    private void assertAdmin(User user) {
        if (user == null || user.getAuthorities() == null || user.getAuthorities().stream().noneMatch(a ->
                a.getAuthority().equalsIgnoreCase("ADMIN") ||
                        a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"))) {
            throw new SecurityException("Platform administrator role required");
        }
    }

    public record SwitchProviderRequest(LightningProviderType provider) {}
}
