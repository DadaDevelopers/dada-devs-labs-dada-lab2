package com.dada_labs_two.chamavault.project_commons.codes.services;

import com.dada_labs_two.chamavault.project_commons.codes.dtos.CodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.dtos.ValidateCodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.project_commons.codes.repository.CodeRepository;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;

import static com.dada_labs_two.chamavault.users.services.UserService.randomCharGenerator;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeService {
    private final CodeRepository codeRepository;
    private final UserRepository userRepository;

    public Code createCode(CodeDTO codesDTO) {
        //check owner exists
        User user = userRepository.findByMsisdn(codesDTO.getOwnerMsisdn()).orElseThrow(()-> new RuntimeException("User not found"));

        //check if code got passed, if not generate
        String code = StringUtils.isBlank(codesDTO.getCode()) ?
                randomCharGenerator().toUpperCase() : codesDTO.getCode();

        //check expiration, default is 15 mins
        ZonedDateTime expiryDate = codesDTO.getExpirationDate() == null ?ZonedDateTime.now().plusMinutes(15) : codesDTO.getExpirationDate();

        return codeRepository.save(Code.builder()
                .code(code)
                .name(codesDTO.getName())
                .active(codesDTO.isActive())
                .description(codesDTO.getDescription())
                .expirationDate(expiryDate)
                .owner(user)
                .extraData(codesDTO.getExtraData())
                .build());
    }

    public Code validateCode(ValidateCodeDTO validateCodeDTO) {
        //check code by the owner exist and is active
        User owner = userRepository.findByMsisdn(validateCodeDTO.getOwnerMsisdn())
                .orElseThrow(()-> new RuntimeException("User not found"));
        Code code = codeRepository.findByCodeAndOwnerAndActiveTrue(validateCodeDTO.getCode(), owner).orElseThrow(
                ()-> new RuntimeException("No active code was found for user with phone: " + validateCodeDTO.getOwnerMsisdn()));
        //check if expired
        if (code.getExpirationDate().isBefore(ZonedDateTime.now()))
            throw new RuntimeException("Code has expired");
        return code;
    }

    public String verifyRegistrationCode(ValidateCodeDTO validateCodeDTO) {
        //find owner
        User owner = userRepository.findByMsisdn(validateCodeDTO.getOwnerMsisdn())
                .orElseThrow(()-> new RuntimeException("User not found"));

        //validate code
        Code code = validateCode(validateCodeDTO);

        //update validation status
        owner.setIsVerified(true);
        userRepository.save(owner);

        //delete code
        deleteByCode(validateCodeDTO.getCode());

        return validateCodeDTO.getCode() + "for "+ code.getName()+ "has been verified";
    }

    public Optional<Code> findByCode(String code) {
        return codeRepository.findById(code);
    }

    public void  deleteByCode(String code) {
        codeRepository.deleteById(code);
    }

    public Page<Code> listCodes(Pageable pageable) {
        return codeRepository.findAll(pageable);
    }
}
