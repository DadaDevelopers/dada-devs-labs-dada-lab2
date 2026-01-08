package com.dada_labs_two.chamavault.project_commons.codes.models;

import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name = "codes")
@SQLRestriction("deleted_at is null")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Code {
    @Id
    private String code;

    private String name;

    @Column(columnDefinition = "boolean default true")
    private boolean active;

    private String description;

    private ZonedDateTime expirationDate;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> extraData = new HashMap<>();
}
