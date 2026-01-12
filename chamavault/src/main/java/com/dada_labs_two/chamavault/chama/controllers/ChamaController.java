package com.dada_labs_two.chamavault.chama.controllers;

import com.dada_labs_two.chamavault.chama.dtos.CreateChamaDTO;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.services.ChamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chama")
@RequiredArgsConstructor
public class ChamaController {
    private final ChamaService chamaService;

    @PostMapping
    public ResponseEntity<Chama> initiateChamaCreation(@RequestBody CreateChamaDTO chama) {
        return ResponseEntity.ok(chamaService.createChama(chama));
    }
}
