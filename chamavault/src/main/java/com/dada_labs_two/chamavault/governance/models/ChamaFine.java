package com.dada_labs_two.chamavault.governance.models;
import com.dada_labs_two.chamavault.chama.models.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name="chama_fines")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChamaFine {
 @Id
 @GeneratedValue(strategy=GenerationType.UUID)
 private UUID reference;

 @ManyToOne(optional=false)
 private Chama chama;

 @ManyToOne(optional=false)
 private ChamaMember member;

 @Column(nullable=false)
 private Long amountSats;

 private String reason;

 @Column(nullable=false)
 private Boolean paid;

 @CreationTimestamp
 private ZonedDateTime createdAt;
}
