package com.dada_labs_two.chamavault.users.services;

import com.dada_labs_two.chamavault.users.configs.JwtService;
import com.dada_labs_two.chamavault.users.dtos.AuthenticationRequestDTO;
import com.dada_labs_two.chamavault.users.dtos.AuthenticationResponseDTO;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponseDTO register(UsersDTO request) {
        User user = userService.registerUser(request);
        var jwt = jwtService.generateToken(user);

        return AuthenticationResponseDTO.builder()
                .token(jwt)
                .expiration(jwtService.extractExpiration(jwt))
                .user(user)
                .build();
    }

    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO request) {
        User user = userService.findByMsisdn(request.getMsisdn());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

        var jwt = jwtService.generateToken(user);
        return AuthenticationResponseDTO.builder()
                .token(jwt)
                .expiration(jwtService.extractExpiration(jwt))
                .user(user)
                .build();
    }
}
