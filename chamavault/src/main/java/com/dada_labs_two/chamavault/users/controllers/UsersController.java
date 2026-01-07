package com.dada_labs_two.chamavault.users.controllers;

import com.dada_labs_two.chamavault.users.dtos.AccountSuspensionDTO;
import com.dada_labs_two.chamavault.users.dtos.ProfileDTO;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.models.ProfileActions;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsersController {
    private final UserService userService;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid UsersDTO usersDTO) {
        return new ResponseEntity<>(userService.registerUser(usersDTO), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<User> getUserByPhoneNumber(@RequestParam String msisdn) {
        return new ResponseEntity<>(userService.findByMsisdn(msisdn), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<User>> fetchPagedUsers(Pageable page) {
        return new ResponseEntity<>(userService.listUsers(page), HttpStatus.OK);
    }

    @GetMapping("/{msisdn}/profile")
    public ResponseEntity<ProfileDTO> getUserProfileByMsisdn(@PathVariable String msisdn) {
        return ResponseEntity.ok(userService.getProfile(msisdn));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDTO> updateProfile(@RequestBody @Valid ProfileDTO profileDTO) {
        return new ResponseEntity<>(userService.updateProfile(profileDTO), HttpStatus.OK);
    }

    @GetMapping("/recover-account/{msisdn}")
    public ResponseEntity<String> recoverUserAccount(@PathVariable String msisdn) {
        userService.forgotPassword(msisdn);
        return ResponseEntity.ok("otp has been dispatched");
    }

    @PostMapping("/retrieve-account/{msisdn}")
    public ResponseEntity<ProfileDTO> verifyOtpAndRetrieveAccount(@PathVariable String msisdn,
                                                             @RequestParam(required = true) String otp,
                                                                  @RequestParam(required = true) String newPassword) {
        return ResponseEntity.ok(userService.verifyOtpAndRetrieveAccount(msisdn,  otp, newPassword));
    }

    @GetMapping("/forgot-password/{msisdn}")
    public ResponseEntity<String> forgotPassword(@PathVariable String msisdn) {
        userService.forgotPassword(msisdn);
        return ResponseEntity.ok("otp has been dispatched");
    }

    @PostMapping("/account-suspension")
    public ResponseEntity<ProfileActions> requestAccountSuspension(@RequestBody @Valid AccountSuspensionDTO suspensionDTO) {
        return new ResponseEntity<>(userService.accountSuspended(suspensionDTO), HttpStatus.OK);
    }

    @PostMapping("/request-account-deletion")
    public ResponseEntity<ProfileActions> requestAccountDeletion(@RequestBody @Valid AccountSuspensionDTO suspensionDTO) {
        return new ResponseEntity<>(userService.accountRequestDeletion(suspensionDTO), HttpStatus.OK);
    }
}
