package com.dada_labs_two.chamavault.users.models;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.ZonedDateTime;
import java.util.*;

@Data
@Builder
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userReference;

    @Column(nullable = false, unique = true)
    private String msisdn;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean enabled = true;

    @Column(columnDefinition = "boolean default false")
    private Boolean isVerified = false;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    @ManyToMany(targetEntity = Roles.class, fetch = FetchType.EAGER)
    private Set<Roles> roles;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @JoinTable(
            name = "users_countries",
            joinColumns = @JoinColumn(name = "users_user_reference"), // Column in join table pointing to User
            inverseJoinColumns = @JoinColumn(name = "countries_iso_code") // Column in join table pointing to Country
    )
    private Set<Countries> countries;

    private Set<UUID> referrals = new HashSet<>();

    @Column(nullable = false, unique = true)
    private String referralCode;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> kyc = new HashMap<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (Roles role : roles) {
            authorities.add(new SimpleGrantedAuthority(role.getRoleName()));
        }
        return authorities;
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return enabled;
    }

    @Override
    public boolean isAccountNonLocked() {
        return enabled;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return enabled;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
