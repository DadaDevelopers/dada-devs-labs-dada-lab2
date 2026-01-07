package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.project_commons.codes.dtos.CodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.project_commons.codes.services.CodeService;
import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.countries.services.CountryService;
import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import com.dada_labs_two.chamavault.project_commons.roles.services.RoleService;
import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.dtos.AccountSuspensionDTO;
import com.dada_labs_two.chamavault.users.dtos.ProfileActionsDTO;
import com.dada_labs_two.chamavault.users.dtos.ProfileDTO;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.models.ProfileActions;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.ProfileActionsRepository;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.github.javafaker.Faker;
import io.micrometer.common.util.StringUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final CountryService countryService;
    private final RoleService roleService;
    private final CodeService codeService;
    private final ProfileActionService profileActionService;

    private final UserRepository userRepository;
    private final ProfileActionsRepository  profileActionsRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(UsersDTO usersDTO) {
        System.out.println("Registering user "+ usersDTO);
        Set<Countries> residentCountries = new HashSet<>();

        usersDTO.getCountries().forEach(country -> {
            residentCountries.add(countryService.findByCountryCode(country.toUpperCase())
                    .orElse(countryService.findByCountryCode("KE").orElseThrow()));
        });

        //User already registered
        if (userRepository.findByMsisdn(usersDTO.getMsisdn()).isPresent()) {
            throw new RuntimeException("User with phone number " + usersDTO.getMsisdn() + " already exists");
        }

        //passwords are identical check
        if (usersDTO.getPassword() == null || usersDTO.getPassword().isEmpty() || usersDTO.getPassword().length() < 8
                || (!usersDTO.getPassword().contentEquals(usersDTO.getPasswordReEntered())) ) {
            throw new RuntimeException("Passwords failed acceptance criteria");
        }

        //roles
        Set<Roles> residentRoles = new HashSet<>();
        for (Roles role : usersDTO.getRoles()) {
            Roles dbRole = roleService.findRoleByName(role.getRoleName().toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + role.getRoleName()));
            residentRoles.add(dbRole);
        }

        User users = userRepository.save(User.builder()
                        .msisdn(usersDTO.getMsisdn())
                .passwordHash(passwordEncoder.encode(usersDTO.getPassword()))
                .roles(residentRoles)
                        .isVerified(false)
                        .suspended(false)
                .enabled(true)
                        .referralCode(randomCharGenerator())
                        .username(StringUtils.isNotBlank(usersDTO.getUsername()) ? usersDTO.getUsername() : generateRandomUsername())
                .countries(residentCountries)
                .kyc(usersDTO.getKyc())
                .build());

        //update for referral
        if (StringUtils.isNotBlank(usersDTO.getReferralCode())) {
            //get referrer
            Optional<User> optReferrer = userRepository.findByReferralCode(usersDTO.getReferralCode());

            if (optReferrer.isPresent()) {
                User referrer = optReferrer.get();
                if (referrer.getReferrals() == null)
                    referrer.setReferrals(new HashSet<>());

                referrer.getReferrals().add(users.getUserReference());
                userRepository.save(referrer);
            }
        }

        //action
        profileActionService.createProfileActions(users, Activity.CREATED,"registration",
                "user is registered", "smart chama enthusiast", "[Admins]: welcome aboard!",
                ZonedDateTime.now().plusYears(5));

        //send OTP code
        codeService.createCode(CodeDTO.builder()
                        .ownerMsisdn(usersDTO.getMsisdn())
                        .active(true)
                        .name("REGISTRATION_OTP")
                .build());
        return users;
    }

    public Page<User> listUsers(Pageable pageable) {
        System.out.println("listUsers");
        return userRepository.findAll(pageable);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    public User findByMsisdn(String msisdn) {
        return userRepository.findByMsisdn(msisdn).orElse(null);
    }
    public User getUserByMsisdn(String msisdn) {
        return userRepository.findByMsisdn(msisdn).orElseThrow(() ->
                new RuntimeException("User not found by phone: " + msisdn));
    }

    public ProfileDTO getProfile(String msisdn) {
        User user = getUserByMsisdn(msisdn);
        List<ProfileActions> profileActionsList = profileActionsRepository.findByUserAccount(user);

        return mapToProfileDTO(user, profileActionsList);
    }

    @Transactional
    public ProfileActions accountSuspended(AccountSuspensionDTO accountSuspensionDTO) {
        User user = getUserByMsisdn(accountSuspensionDTO.getMsisdn());
        user.setSuspended(true);
        user = userRepository.save(user);

        //action
        return profileActionService.createProfileActions(user, Activity.SUSPENDED, "account_suspension",
                accountSuspensionDTO.getDescription(), accountSuspensionDTO.getReason(), accountSuspensionDTO.getComment(),
                accountSuspensionDTO.getDeadline());
    }

    @Transactional
    public ProfileActions accountRequestDeletion(AccountSuspensionDTO accountSuspensionDTO) {
        User user = getUserByMsisdn(accountSuspensionDTO.getMsisdn());

        //action
        return profileActionService.createProfileActions(user, Activity.USER_REQUEST_DELETION,"mark for deletion",
                accountSuspensionDTO.getDescription(), accountSuspensionDTO.getReason(),
                "[Admins]: account will be deleted by "+ZonedDateTime.now().plusMonths(3),
                ZonedDateTime.now().plusMonths(3));
    }

    @Transactional
    public ProfileDTO verifyOtpAndRetrieveAccount(String msisdn, String otp, String newPassword) {
        User user = getUserByMsisdn(msisdn);
        Code code = codeService.findByCode(otp).orElseThrow(()-> new RuntimeException("Code not found: " + otp));

        if (user != code.getOwner()) throw new RuntimeException("User provided does not match otp owner");

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setIsVerified(true);
        user = userRepository.save(user);
        return getProfile(user.getMsisdn());
    }

    @Transactional
    public ProfileDTO updateProfile(ProfileDTO profileDTO) {
        User user = getUserByMsisdn(profileDTO.getMsisdn());

        if (profileDTO.getKyc() != null) {
            user.getKyc().putAll(profileDTO.getKyc());
        }
        if (StringUtils.isNotBlank(profileDTO.getUsername())) {
            user.setUsername(profileDTO.getUsername());
        }

        user = userRepository.save(user);
        return getProfile(user.getMsisdn());

    }

    @Transactional
    public void forgotPassword(String msisdn) {
        User user = getUserByMsisdn(msisdn);

        //send OTP
        codeService.createCode(CodeDTO.builder()
                .ownerMsisdn(msisdn)
                .active(true)
                .name("FORGOT_PASSWORD_OTP")
                .build());

        user.setIsVerified(false);
        userRepository.save(user);
    }

    ProfileDTO mapToProfileDTO(User user,  List<ProfileActions> profileActionsList) {
        if(user == null) throw new RuntimeException("User is null");

        List<ProfileActionsDTO> cleanedActionsList = new  ArrayList<ProfileActionsDTO>();
        if(profileActionsList != null) {
            profileActionsList.forEach(profileActions -> {
                cleanedActionsList.add(ProfileActionsDTO.builder()
                        .action(profileActions.getAction())
                        .activity(profileActions.getActivity())
                        .description(profileActions.getDescription())
                        .reason(profileActions.getReason())
                        .count(profileActions.getCount())
                        .comment(profileActions.getComment())
                        .deadline(profileActions.getDeadline())
                        .createdAt(profileActions.getCreatedAt())
                        .lastPerformedAt(profileActions.getLastPerformedAt())
                        .build());
            });
        }

        return ProfileDTO.builder()
                .userReference(user.getUserReference())
                .msisdn(user.getMsisdn())
                .username(user.getUsername())
                .enabled(user.isEnabled())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles())
                .countries(user.getCountries())
                .referrals(user.getReferrals())
                .referralCode(user.getReferralCode())
                .kyc(user.getKyc())
                .actions(cleanedActionsList)
                .build();
    }







    public  static String randomCharGenerator() {
        char[] chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789".toCharArray();
        int max=100000000;
        int random=(int) (Math.random()*max);
        StringBuffer sb=new StringBuffer();

        while (random>0)
        {
            sb.append(chars[random % chars.length]);
            random /= chars.length;
        }

        return "VAULT-" + sb.toString();
    }

    public static String generateRandomUsername() {
        Faker faker = new Faker();
        return faker.superhero().prefix()+faker.name().firstName()+faker.address().buildingNumber();
    }
}
