package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.models.ProfileActions;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.ProfileActionsRepository;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileActionService {
    private final UserRepository userRepository;
    private final ProfileActionsRepository profileActionsRepository;

    public ProfileActions createProfileActions(User userAccount, Activity activity, String action, String description,
                                               String reason, String comment, ZonedDateTime deadline) {
        log.info("{} triggered by {}", activity, userAccount.getUsername());

        if (userAccount == null) throw new RuntimeException("user account is null");
        if (StringUtils.isBlank(reason)) throw new RuntimeException("reason is blank");
        if (deadline == null) throw new RuntimeException("deadline is null");

        //check if exist
        ProfileActions profileActions = profileActionsRepository.findByActivityAndUserAccount(activity, userAccount)
                .orElse(null);

        if (profileActions == null) {
            profileActions = ProfileActions.builder()
                    .userAccount(userAccount)
                    .action(action)
                    .activity(activity)
                    .description(description)
                    .reason(reason)
                    .count(0)
                    .comment(comment)
                    .deadline(deadline)
                    .build();
        } else {
            profileActions.setReason(reason);
            profileActions.setDeadline(deadline);

            if (StringUtils.isNotBlank(action)) profileActions.setAction(action);
            if (StringUtils.isNotBlank(description)) profileActions.setDescription(description);
            if (StringUtils.isNotBlank(comment)) profileActions.setComment(comment);

            profileActions.setComment(comment += 1L);
        }
        return profileActionsRepository.save(profileActions);
    }
}
