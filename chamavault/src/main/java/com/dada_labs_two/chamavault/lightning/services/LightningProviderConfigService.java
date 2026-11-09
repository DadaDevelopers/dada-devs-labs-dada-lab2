package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import com.dada_labs_two.chamavault.lightning.models.LightningProviderConfig;
import com.dada_labs_two.chamavault.lightning.repositories.LightningProviderConfigRepository;
import com.dada_labs_two.chamavault.users.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LightningProviderConfigService {
    private static final int CONFIG_ID = 1;
    private final LightningProviderConfigRepository repository;
    private final LightningProviderType configuredDefault;

    public LightningProviderConfigService(LightningProviderConfigRepository repository,
                                          @Value("${lightning.default-provider:LNBITS}") String configuredDefault) {
        this.repository = repository;
        this.configuredDefault = LightningProviderType.valueOf(configuredDefault.trim().toUpperCase());
    }

    public LightningProviderType activeProvider() {
        return repository.findById(CONFIG_ID)
                .map(LightningProviderConfig::getActiveProvider)
                .orElse(configuredDefault);
    }

    @Transactional
    public LightningProviderConfig switchProvider(LightningProviderType provider, User user) {
        assertAdmin(user);
        LightningProviderConfig config = repository.findById(CONFIG_ID)
                .orElseGet(() -> LightningProviderConfig.builder().id(CONFIG_ID).build());
        config.setActiveProvider(provider);
        config.setUpdatedBy(user.getUserReference());
        return repository.save(config);
    }

    private void assertAdmin(User user) {
        if (user == null || user.getAuthorities() == null || user.getAuthorities().stream().noneMatch(a ->
                a.getAuthority().equalsIgnoreCase("ADMIN") ||
                        a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"))) {
            throw new SecurityException("Platform administrator role required");
        }
    }
}
