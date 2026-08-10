package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.messaging.service.MessagingService;
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
    private final MessagingService messagingService;
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
        //send message notification to user
        String body = """
                Dear %s,
                
                Profile update notification:
                 Action: %s
                 Activity: %s
                 Reason: %s
                 Comments: %s
                 Deadline: %s
                """.formatted(userAccount.getKyc().get("username"),
                action, activity, reason, comment, deadline);

        sendNotification(userAccount, action, body);
        return profileActionsRepository.save(profileActions);
    }


    public void notifyRotationContribution(
            User contributor,
            User beneficiary,
            ContributionCycle cycle,
            Long amountSats,
            String paymentHash
    ) {
        String subject = "Rotation contribution successful";

        String body = """
            Dear %s,
            
            Your contribution for Rotation %d has been successfully processed.
            
            Contribution details:
            Amount: %,d sats
            Beneficiary: %s
            Payment reference: %s
            
            Your contribution has been sent to the beneficiary's contribution wallet.
            
            Thank you for your contribution.
            
            Regards,
            ChamaVault
            """.formatted(
                contributor.getUsername(),
                cycle.getRotationIndex(),
                amountSats,
                beneficiary.getUsername(),
                paymentHash
        );

        sendNotification(contributor, subject, body);
    }

    public void notifyRotationContributionReceived(
            User beneficiary,
            User contributor,
            ContributionCycle cycle,
            Long amountSats,
            String paymentHash
    ) {
        String subject = "Rotation contribution received";

        String body = """
            Dear %s,
            
            You have received a contribution for Rotation %d.
            
            Contribution details:
            Amount: %,d sats
            Contributor: %s
            Payment reference: %s
            
            The contribution has been successfully processed and credited
            towards your rotation.
            
            Regards,
            ChamaVault
            """.formatted(
                beneficiary.getUsername(),
                cycle.getRotationIndex(),
                amountSats,
                contributor.getUsername(),
                paymentHash
        );

        sendNotification(beneficiary, subject, body);
    }

    public void notifyOffRampPayment(
            User payer,
            String recipientMsisdn,
            Long amountSats,
            String paymentHash
    ) {
        String subject = "Off-ramp payment successful";

        String body = """
            Dear %s,
            
            Your off-ramp payment has been successfully initiated.
            
            Payment details:
            Amount: %,d sats
            Recipient: %s
            Lightning payment reference: %s
            
            The Lightning payment has been sent to the off-ramp provider
            for conversion to mobile money.
            
            Please note that final mobile-money settlement is subject to
            the off-ramp provider's processing.
            
            Regards,
            ChamaVault
            """.formatted(
                payer.getUsername(),
                amountSats,
                recipientMsisdn,
                paymentHash
        );

        sendNotification(payer, subject, body);
    }

    public void sendNotification(User user, String subject, String body) {
        String email = user.getKyc() != null ? user.getKyc().get("email") : null;
        if (email != null && !email.isBlank()) {
            // send email
            messagingService.sendEmail(email, subject, body);
        }
    }
}
