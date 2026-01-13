package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaInvite;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChamaInviteRepository extends JpaRepository<ChamaInvite, UUID> {
    Optional<ChamaInvite> findByInviteCode(Code inviteCode);
    Page<ChamaInvite> findByChama(Pageable pageable, Chama chama);
    Optional<ChamaInvite> findByInviteCodeAndPausedFalse(Code inviteCode);
}
