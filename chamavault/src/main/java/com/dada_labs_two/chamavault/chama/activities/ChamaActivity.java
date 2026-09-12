package com.dada_labs_two.chamavault.chama.activities;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.ZonedDateTime;
import java.util.*;

@Entity @Table(name="chama_activities", indexes={
 @Index(name="idx_chama_activity_feed", columnList="chama_reference,occurred_at"),
 @Index(name="idx_chama_activity_type", columnList="activity_type"),
 @Index(name="idx_chama_activity_actor", columnList="actor_user_reference")},
 uniqueConstraints=@UniqueConstraint(name="ux_chama_activity_event_key", columnNames="event_key"))
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class ChamaActivity {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID reference;
 @ManyToOne(optional=false) @JoinColumn(name="chama_reference") private Chama chama;
 @ManyToOne @JoinColumn(name="actor_user_reference") private User actor;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ChamaActivityType activityType;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ActivityCategory category;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ActivityStatus status;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ActivityVisibility visibility;
 @Column(nullable=false) private String title;
 @Column(length=1000) private String description;
 private String subjectType;
 private String subjectReference;
 private Long amountSats;
 private UUID walletReference;
 private UUID transactionReference;
 private UUID governanceRequestReference;
 private String eventKey;
 @JdbcTypeCode(SqlTypes.JSON) private Map<String,String> metadata = new HashMap<>();
 @Column(nullable=false) private ZonedDateTime occurredAt;
 @CreationTimestamp private ZonedDateTime createdAt;
}
