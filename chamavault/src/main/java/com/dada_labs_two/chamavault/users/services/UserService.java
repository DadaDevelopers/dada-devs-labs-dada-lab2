package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.countries.services.CountryService;
import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import com.dada_labs_two.chamavault.project_commons.roles.services.RoleService;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.models.User;
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

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final CountryService countryService;
    private final RoleService roleService;

    private final UserRepository userRepository;
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
