package com.dada_labs_two.chamavault.project_commons.codes.controllers;

import com.dada_labs_two.chamavault.project_commons.codes.dtos.CodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.dtos.ValidateCodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.project_commons.codes.services.CodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/codes")
@RequiredArgsConstructor
public class CodeController {
    private static  final String  CODE = "/{code}";

    private final CodeService codesService;

    @PostMapping
    public ResponseEntity<Code> addCode(@RequestBody @Valid CodeDTO codesDTO){
        return new ResponseEntity<>(codesService.createCode(codesDTO), HttpStatus.OK);
    }

    @PostMapping("/pre-registration/code-generate")
    public ResponseEntity<Code> preregistrationCodeGeneration(@RequestBody @Valid CodeDTO codesDTO){
        return new ResponseEntity<>(codesService.preregistrationCodeGeneration(codesDTO), HttpStatus.OK);
    }

    @PostMapping("/pre-registration/code-validation")
    public ResponseEntity<Code> preregistrationCodeValidation(@RequestBody @Valid ValidateCodeDTO codesDTO){
        return new ResponseEntity<>(codesService.preregistrationCodeValidation(codesDTO), HttpStatus.OK);
    }

    @PostMapping("/validate")
    public ResponseEntity<Code> validateCode(@RequestBody @Valid ValidateCodeDTO codesDTO){
        return new ResponseEntity<>(codesService.validateCode(codesDTO), HttpStatus.OK);
    }

    @PostMapping("/verify-registration-code")
    public ResponseEntity<String> verifyRegistrationCode(@RequestBody @Valid ValidateCodeDTO codesDTO){
        return new ResponseEntity<>(codesService.verifyRegistrationCode(codesDTO), HttpStatus.OK);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestBody @Valid ValidateCodeDTO codesDTO){
        //validate
        codesService.validateCode(codesDTO);
        //then delete
        codesService.deleteByCode(codesDTO.getCode());

        return new ResponseEntity<>("code successfully verified", HttpStatus.OK);
    }

    @DeleteMapping(value = CODE)
    public ResponseEntity<String> deleteCode(@PathVariable String code){
        codesService.deleteByCode(code);
        return new ResponseEntity<>("delete code", HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<Code>> getAllCodes(Pageable pageable){
        return new ResponseEntity<>(codesService.listCodes(pageable), HttpStatus.OK);
    }

    @GetMapping(value = CODE)
    public ResponseEntity<Optional<Code>> getCode(@PathVariable String code){
        return new ResponseEntity<>(codesService.findByCode(code), HttpStatus.OK);
    }
}
