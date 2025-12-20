package com.dada_labs_two.chamavault.users.controllers;

import com.dada_labs_two.chamavault.users.dtos.AuthenticationRequestDTO;
import com.dada_labs_two.chamavault.users.dtos.AuthenticationResponseDTO;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/setup")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationService authenticationService;

    @PostMapping("/sign-up")
    public ResponseEntity<AuthenticationResponseDTO> register(
            @RequestBody UsersDTO request
    ) {
        AuthenticationResponseDTO responseDTO = authenticationService.register(request);
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> authenticateRequest(
            @RequestBody AuthenticationRequestDTO request
    ) {
        return new ResponseEntity<>(authenticationService.authenticate(request), HttpStatus.OK);
    }

}
