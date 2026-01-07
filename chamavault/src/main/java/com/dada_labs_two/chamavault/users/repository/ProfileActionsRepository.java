package com.dada_labs_two.chamavault.users.repository;

import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.models.ProfileActions;
import com.dada_labs_two.chamavault.users.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileActionsRepository extends JpaRepository<ProfileActions, Long> {
    Optional<ProfileActions> findByActivityAndUserAccount(Activity activity,  User userAccount);
    List<ProfileActions> findByUserAccount(User userAccount);
}
