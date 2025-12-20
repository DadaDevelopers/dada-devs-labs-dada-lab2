package com.dada_labs_two.chamavault.users.controllers;

import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
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
}
