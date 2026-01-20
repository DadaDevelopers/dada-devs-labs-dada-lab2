package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.users.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChamaMemberRepository extends JpaRepository<ChamaMember, UUID> {
    @Query("""
        SELECT cm.chama
        FROM ChamaMember cm
        JOIN cm.user u
        WHERE u.msisdn = :msisdn
          AND cm.status = :status
    """)
    List<Chama> findChamasByUserMsisdn(
            @Param("msisdn") String msisdn,
            @Param("status") MembershipStatus status
    );

    Optional<ChamaMember> findByUserAndChama(User user, Chama chama);

    Page<ChamaMember> findAllByChama_ChamaReferenceAndStatus(UUID chamaReference, MembershipStatus status, Pageable pageable);

    List<ChamaMember> findAllByChama_ChamaReferenceAndStatus(UUID chamaReference, MembershipStatus status);

    //Count all members in a Chama (by chama reference)
    long countByChama_ChamaReference(UUID chamaReference);

    //Count only ACTIVE members in a Chama
    long countByChama_ChamaReferenceAndStatus(UUID chamaReference, MembershipStatus status);

    //Exclude soft-deleted members
    long countByChama_ChamaReferenceAndDeletedAtIsNull(UUID chamaReference);

    //Exclude soft-deleted members combined with status
    long countByChama_ChamaReferenceAndStatusAndDeletedAtIsNull(
            UUID chamaReference,
            MembershipStatus status
    );

    //check user with phone already a member
    boolean existsByChama_ChamaReferenceAndUser_MsisdnAndDeletedAtIsNull(
            UUID chamaReference,
            String msisdn
    );

    //is active member
    boolean existsByChama_ChamaReferenceAndUser_MsisdnAndStatusAndDeletedAtIsNull(
            UUID chamaReference,
            String msisdn,
            MembershipStatus status
    );


    List<ChamaMember> findAllByChama_ChamaReferenceAndStatusOrderByJoinedAtAsc(
            UUID chamaReference, MembershipStatus membershipStatus);


}
