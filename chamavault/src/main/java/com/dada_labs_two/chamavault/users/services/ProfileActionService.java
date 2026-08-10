package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.messaging.service.MessagingService;
import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.models.ProfileActions;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.ProfileActionsRepository;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
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
        String beneficiaryName = getDisplayName(beneficiary);
        String contributorName = getDisplayName(contributor);

        String subject = "Your Chama contribution is on its way!";

        String body = """
            Hi %s!
            
            Great news — your contribution for Rotation %d has been
            successfully processed.
            
             Contribution: %,d sats
             Going to: %s
            
            Your contribution has been sent towards %s's rotation.
            
            Thank you for keeping the Chama moving! 
            
            Payment reference: %s
            
            If you didn't expect this payment, please get in touch with
            the ChamaVault team.
            
            Warmly,
            The ChamaVault Team 💜
            """.formatted(
                contributorName,
                cycle.getRotationIndex(),
                amountSats,
                beneficiaryName,
                beneficiaryName,
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
        String contributorName = getDisplayName(contributor);

        String subject = "You've received a Chama contribution!";

        String body = """
            Hi %s! 
            
            Good news — you've received a contribution towards
            Rotation %d of your Chama.
            
             Amount: %,d sats
             From: %s
            
            Your contribution has been successfully processed and
            added towards your rotation.
            
            Every contribution brings the Chama one step closer.
            Thanks for being part of it! 💜
            
            Payment reference: %s
            
            Warmly,
            The ChamaVault Team
            """.formatted(
                getDisplayName(beneficiary),
                cycle.getRotationIndex(),
                amountSats,
                contributorName,
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
        String subject = " Your off-ramp payment is on its way!";

        String body = """
            Hi %s! 
            
            We've successfully processed your off-ramp payment.
            
             Amount: %,d sats
             Recipient: %s
            
            Your Lightning payment has been sent is currently being processed
             for conversion to mobile money.
            
            The mobile-money portion may take a little longer to
            complete depending on the provider's processing time.
            
            We'll keep you informed if anything else is needed.
            
            Payment reference: %s
            
            Thanks for using ChamaVault! 💜
            
            Warmly,
            The ChamaVault Team
            """.formatted(
                getDisplayName(payer),
                amountSats,
                maskPhoneNumber(recipientMsisdn),
                paymentHash
        );

        sendNotification(payer, subject, body);
    }

    public void notifyChamaCreated(User creator, Chama chama, Wallet wallet) {

        String subject = " Your Chama is ready!";

        String body = """
            Hi %s! 
            
            Great news — your Chama, "%s", has been created successfully!
            
            Here's a quick look at your new Chama:
            
              Chama: %s
              Contribution: %,d sats
              Maximum members: %d
              Visibility: %s
              Current rotation: %d
            
            We've also set up a Lightning wallet for your Chama. This
            wallet can be used for pooled Chama funds and other group
            transactions.
            
            Your Chama is now ready for you to start inviting members
            and building together. 
            
            Welcome to ChamaVault — we're happy to have you here! 💜
            
            Warmly,
            The ChamaVault Team
            """.formatted(
                creator.getUsername(),
                chama.getName(),
                chama.getName(),
                chama.getContributionAmount(),
                chama.getMaxMembers(),
                chama.getVisibility(),
                chama.getCurrentRotationIndex()
        );

        sendNotification(creator, subject, body);
    }

    public void notifyJoinRequestReceived(
            User applicant,
            Chama chama
    ) {
        String subject = " Your request to join %s is in!".formatted(chama.getName());

        String body = """
            Hi %s!
            
            Thanks for wanting to be part of "%s"!
            
            We've received your request to join the Chama and the
            admins are now taking a look.
            
              Contribution: %,d sats
              Chama: %s
            
            For now, there's nothing else you need to do. We'll let
            you know as soon as the admins make a decision.
            
            Fingers crossed!
            
            Warmly,
            The ChamaVault Team 💜
            """.formatted(
                applicant.getUsername(),
                chama.getName(),
                chama.getContributionAmount(),
                chama.getName()
        );

        sendNotification(applicant, subject, body);
    }

    public void notifyAdminOfJoinRequest(
            User admin,
            User applicant,
            Chama chama
    ) {
        String subject = "Someone wants to join %s".formatted(chama.getName());

        String body = """
            Hi %s!
            
            You have a new request to join "%s".
            
              Applicant: %s
              Contact: %s
              Contribution: %,d sats
            
            Head over to your Chama dashboard to review the request
            and decide whether you'd like to approve it.
            
            Your Chama is growing!
            
            Warmly,
            The ChamaVault Team 💜
            """.formatted(
                admin.getUsername(),
                chama.getName(),
                getDisplayName(applicant),
                maskPhoneNumber(applicant.getMsisdn()),
                chama.getContributionAmount()
        );

        sendNotification(admin, subject, body);
    }

    public void notifyJoinRequestApproved(
            User member,
            Chama chama
    ) {
        String subject = "You're officially part of %s!".formatted(chama.getName());

        String body = """
            Hi %s!
            
            Great news — your request to join "%s" has been approved!
            
            You're officially part of the Chama.
            
             Contribution: %,d sats
            
            You can now head over to your Chama dashboard, keep an eye
            on the current rotation, and make your contributions when
            they're due.
            
            Welcome to the team!
            
            We're excited to have you with us.
            
            Warmly,
            The ChamaVault Team 💜
            """.formatted(
                member.getUsername(),
                chama.getName(),
                chama.getContributionAmount()
        );

        sendNotification(member, subject, body);
    }

    public void notifyJoinRequestRejected(
            User member,
            Chama chama
    ) {
        String subject = "Update on your %s request".formatted(chama.getName());

        String body = """
            Hi %s,
            
            Thanks for your interest in joining "%s".
            
            Unfortunately, the Chama admins weren't able to approve
            your request at this time.
            
            We know that's not the news you were hoping for, but there
            are plenty of other Chamas on ChamaVault that you may find
            a good fit.
            
            Thanks for giving it a try, and we hope to see you around!
            
            Warmly,
            The ChamaVault Team
            """.formatted(
                member.getUsername(),
                chama.getName()
        );

        sendNotification(member, subject, body);
    }

    public void notifyInviteCreated(
            User admin,
            Chama chama,
            String inviteCode,
            ZonedDateTime expiresAt
    ) {
        String subject = "Your Chama invite code is ready!";

        String body = """
        Hi %s!
        
        Your invite code for "%s" has been created successfully.
        
         Chama: %s
         Invite code: %s
         Expires: %s
        
        You can share this invite code with the people you'd
        like to invite to your Chama.
        
        Please keep the invite code private and only share it
        with people you trust.
        
        Warmly,
        The ChamaVault Team 💜
        """.formatted(
                getDisplayName(admin),
                chama.getName(),
                chama.getName(),
                inviteCode,
                expiresAt
        );

        sendNotification(admin, subject, body);
    }


    public void notifyInvitePaused(
            User admin,
            Chama chama,
            String inviteCode,
            ZonedDateTime expiresAt
    ) {
        String subject = "Your Chama invite code has been paused";

        String body = """
        Hi %s!
        
        The invite code for "%s" has been paused.
        
         Chama: %s
         Invite code: %s
         Original expiry: %s
        
        While the invite is paused, nobody will be able to use
        this code to join the Chama.
        
        If you need to allow new members to join using this code,
        you can reactivate it from your Chama dashboard.
        
        Warmly,
        The ChamaVault Team 💜
        """.formatted(
                getDisplayName(admin),
                chama.getName(),
                chama.getName(),
                inviteCode,
                expiresAt
        );

        sendNotification(admin, subject, body);
    }


    public void notifyInviteUsed(
            User admin,
            User newMember,
            Chama chama,
            String inviteCode
    ) {
        String subject = "Your Chama invite code was used";

        String body = """
        Hi %s!
        
        Someone has used your invite code to request to join
        "%s".
        
         Chama: %s
         New member: %s
         Invite code: %s
        
        The member's request is now awaiting approval from a
        Chama administrator.
        
        Please head over to your Chama dashboard to review
        the request.
        
        Your Chama is growing! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                getDisplayName(admin),
                chama.getName(),
                chama.getName(),
                getDisplayName(newMember),
                inviteCode
        );

        sendNotification(admin, subject, body);
    }

    public void notifyContributionCycleStarted(
            User beneficiary,
            Chama chama,
            ContributionCycle cycle
    ) {
        String beneficiaryName = getDisplayName(beneficiary);

        String subject = "Your Chama rotation has started!";

        String body = """
        Hi %s!
        
        It's your turn! Your contribution rotation for "%s" has
        officially started.
        
         Rotation: %d
         Contribution per member: %,d sats
         Expected total: %,d sats
         Start date: %s
         Contribution deadline: %s
        
        Contributions from the other Chama members will be collected
        towards your rotation during this cycle.
        
        You can keep an eye on your Chama dashboard to track the
        progress of your rotation.
        
        We'll let you know as contributions come in.
        
        Good luck with your rotation! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                beneficiaryName,
                chama.getName(),
                cycle.getRotationIndex(),
                cycle.getContributionAmount(),
                cycle.getExpectedTotalContributionAmount(),
                cycle.getStartAt(),
                cycle.getEndAt()
        );

        sendNotification(beneficiary, subject, body);
    }


    public void notifyContributionDue(
            User contributor,
            User beneficiary,
            Chama chama,
            ContributionCycle cycle
    ) {
        String contributorName = getDisplayName(contributor);
        String beneficiaryName = getDisplayName(beneficiary);

        String subject = "Your Chama contribution is due";

        String body = """
        Hi %s!
        
        A new contribution cycle has started for "%s".
        
        Your contribution is expected to go towards %s's rotation.
        
         Rotation: %d
         Amount due: %,d sats
         Deadline: %s
        
        Please make your contribution before the deadline to help keep
        the Chama rotation running smoothly.
        
        You can make your payment from your Chama dashboard.
        
        Thanks for keeping the Chama moving! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                contributorName,
                chama.getName(),
                beneficiaryName,
                cycle.getRotationIndex(),
                cycle.getContributionAmount(),
                cycle.getEndAt()
        );

        sendNotification(contributor, subject, body);
    }


    public void notifyContributionCycleClosed(
            User beneficiary,
            Chama chama,
            ContributionCycle cycle
    ) {
        String beneficiaryName = getDisplayName(beneficiary);

        String subject = "Your Chama rotation has ended";

        String body = """
        Hi %s!
        
        Your contribution rotation for "%s" has now ended.
        
         Rotation: %d
         Expected contribution: %,d sats
         Collected: %,d sats
         Deadline: %s
        
        Thank you for being part of the Chama.
        
        If the expected amount was not fully collected, please check
        your Chama dashboard for the current status and any outstanding
        contributions.
        
        We appreciate you helping keep the Chama moving! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                beneficiaryName,
                chama.getName(),
                cycle.getRotationIndex(),
                cycle.getExpectedTotalContributionAmount(),
                cycle.getCurrentTotalContributionAmount(),
                cycle.getEndAt()
        );

        sendNotification(beneficiary, subject, body);
    }

    public void notifyOnRampInitiated(
            User sender,
            User recipient,
            Long amountSats,
            String mpesaPhone,
            String invoice
    ) {
        String subject = "Your M-Pesa wallet funding request is being processed";

        String body = """
        Hi %s!
        
        We've received your request to fund %s ChamaVault wallet using
        M-Pesa.
        
         Amount: %,d sats
         Wallet recipient: %s
         M-Pesa number: %s
        
        Your request has been successfully submitted and is now being
        processed.
        
        The sats will be credited to the recipient's wallet once the
        M-Pesa processing is completed.
        
        Payment reference:
        %s
        
        If you didn't initiate this request, please contact the
        ChamaVault team.
        
        Thanks for using ChamaVault! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                getDisplayName(sender),
                getDisplayName(recipient),
                amountSats,
                getDisplayName(recipient),
                maskPhoneNumber(mpesaPhone),
                invoice
        );

        sendNotification(sender, subject, body);
    }


    public void notifyOnRampRecipient(
            User recipient,
            User sender,
            Long amountSats,
            String mpesaPhone,
            String invoice
    ) {
        String subject = "Your ChamaVault wallet is being funded";

        String body = """
        Hi %s!
        
        Someone has initiated an M-Pesa funding request for your
        ChamaVault wallet.
        
         Amount: %,d sats
         Initiated by: %s
         M-Pesa number: %s
        
        The request has been submitted and the sats will be credited
        to your wallet once the M-Pesa processing is completed.
        
        Payment reference:
        %s
        
        If you did not expect this wallet funding request, please
        contact the ChamaVault team.
        
        Thanks for using ChamaVault! 💜
        
        Warmly,
        The ChamaVault Team
        """.formatted(
                getDisplayName(recipient),
                amountSats,
                getDisplayName(sender),
                maskPhoneNumber(mpesaPhone),
                invoice
        );

        sendNotification(recipient, subject, body);
    }


    /*
public void notifyInviteCreated(...)
public void notifyInvitePaused(...)
public void notifyJoinRequest(...)
public void notifyJoinRequestApproved(...)
public void notifyJoinRequestRejected(...)
     */

    public void sendNotification(User user, String subject, String body) {
        if (user == null) {
            log.warn("Unable to send notification: user is null");
            return;
        }

        String email = user.getKyc() != null
                ? user.getKyc().get("email")
                : null;

        if (StringUtils.isBlank(email)) {
            log.info(
                    "No email address available for user {}. Skipping notification '{}'",
                    user.getUsername(),
                    subject
            );
            return;
        }

        try {
            messagingService.sendEmail(email, subject, body);

            log.info(
                    "Notification '{}' sent to user {}",
                    subject,
                    user.getUsername()
            );
        } catch (Exception e) {
            log.error(
                    "Failed to send notification '{}' to user {}",
                    subject,
                    user.getUsername(),
                    e
            );
        }
    }

    private String getDisplayName(User user) {
        if (user.getKyc() != null) {
            String name = user.getKyc().get("firstName");

            if (StringUtils.isNotBlank(name)) {
                return name;
            }

            name = user.getKyc().get("username");

            if (StringUtils.isNotBlank(name)) {
                return name;
            }
        }

        return user.getUsername();
    }

    private String maskPhoneNumber(String phoneNumber) {
        if (StringUtils.isBlank(phoneNumber) || phoneNumber.length() < 4) {
            return phoneNumber;
        }

        return "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
