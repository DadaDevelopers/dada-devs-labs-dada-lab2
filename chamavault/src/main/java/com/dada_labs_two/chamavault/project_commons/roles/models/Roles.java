package com.dada_labs_two.chamavault.project_commons.roles.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
@Entity
@Builder
public class Roles {

    @Id
    private String roleName;

    // Tells Jackson how to CREATE a Roles object from a JSON string
    @JsonCreator
    public static Roles fromString(String roleName) {
         return new Roles(roleName);
    }

    // Tell Jackson how to TURN a Roles object INTO a JSON string
    // This ensures that when you send a Roles object back in a response,
    // it appears as "USER" instead of {"roleName": "USER"}
    @JsonValue
    public String getRoleName() {
        return roleName;
    }
}
