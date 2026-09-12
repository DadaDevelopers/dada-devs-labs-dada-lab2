package com.dada_labs_two.chamavault.project_commons.codes.services;

import com.dada_labs_two.chamavault.project_commons.codes.dtos.CodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.dtos.ValidateCodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.project_commons.codes.repository.CodeRepository;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.messaging.service.MessagingService;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static com.dada_labs_two.chamavault.users.services.UserService.randomCharGenerator;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeService {
    private final CodeRepository codeRepository;
    private final UserRepository userRepository;
    private final MessagingService messagingService;

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
                .active(!Boolean.FALSE.equals(codesDTO.getActive()))
                .description(codesDTO.getDescription())
                .expirationDate(expiryDate)
                .owner(user)
                .extraData(codesDTO.getExtraData())
                .build());
    }

    public Code preregistrationCodeGeneration(CodeDTO codesDTO) {
        OtpRecipient recipient = recipient(codesDTO.getIdentifier(), codesDTO.getEmail(), codesDTO.getOwnerMsisdn());

        //check if code got passed, if not generate
        String code = StringUtils.isBlank(codesDTO.getCode()) ?
                randomCharGenerator().toUpperCase() : codesDTO.getCode();

        //check expiration, default is 15 mins
        ZonedDateTime expiryDate = codesDTO.getExpirationDate() == null ?ZonedDateTime.now().plusMinutes(15) : codesDTO.getExpirationDate();

        Map<String, String> extraData = codesDTO.getExtraData() == null
                ? new HashMap<>() : new HashMap<>(codesDTO.getExtraData());
        extraData.put("otpRecipient", recipient.value());
        extraData.put("otpDeliveryChannel", recipient.email() ? "EMAIL" : "PHONE");

        Code saved = codeRepository.save(Code.builder()
                .code(code)
                .name(codesDTO.getName() == null || codesDTO.getName().isBlank() ? "PRE_REGISTRATION_OTP" : codesDTO.getName())
                .active(true)
                .description(codesDTO.getDescription())
                .expirationDate(expiryDate)
                .owner(null)
                .extraData(extraData)
                .build());
        if (recipient.email()) {
            messagingService.sendEmail(recipient.value(),
                    codesDTO.getName() == null || codesDTO.getName().isBlank() ? "ChamaVault verification code" : codesDTO.getName(),
                    "Your ChamaVault one-time verification code is " + saved.getCode() +
                            ". It expires at " + saved.getExpirationDate() + ".");
        } else {
            log.info("Pre-registration OTP generated for phone ending {}. No SMS provider is configured.", maskedPhone(recipient.value()));
        }
        return saved;
    }
    public Code preregistrationCodeValidation(ValidateCodeDTO validateCodeDTO) {
        OtpRecipient recipient = recipient(validateCodeDTO.getIdentifier(), validateCodeDTO.getEmail(), validateCodeDTO.getOwnerMsisdn());
        Code code = codeRepository.findByCodeAndActiveTrue(validateCodeDTO.getCode()).orElseThrow(
                ()-> new RuntimeException("No active code was found for the supplied recipient"));
        //check if expired
        if (code.getExpirationDate().isBefore(ZonedDateTime.now()))
            throw new RuntimeException("Code has expired");
        String storedRecipient = code.getExtraData() == null ? null : code.getExtraData().get("otpRecipient");
        if (storedRecipient != null && !storedRecipient.equals(recipient.value()))
            throw new RuntimeException("Code does not belong to the supplied recipient");
        return code;
    }

    private OtpRecipient recipient(String identifier, String email, String phone) {
        String raw = firstNonBlank(identifier, email, phone);
        if (raw == null) throw new IllegalArgumentException("identifier is required and must be an email address or phone number");
        raw = raw.trim();
        if (raw.contains("@")) {
            String normalized = raw.toLowerCase(Locale.ROOT);
            if (!normalized.matches("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$".toLowerCase(Locale.ROOT)))
                throw new IllegalArgumentException("Invalid email address");
            return new OtpRecipient(normalized, true);
        }
        String normalized = raw.replaceAll("[\\s()-]", "");
        if (!normalized.matches("^\\+?[0-9]{8,15}$"))
            throw new IllegalArgumentException("Invalid phone number");
        return new OtpRecipient(normalized, false);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) if (value != null && !value.isBlank()) return value;
        return null;
    }

    private String maskedPhone(String phone) {
        return phone.length() <= 4 ? "****" : "****" + phone.substring(phone.length() - 4);
    }

    private record OtpRecipient(String value, boolean email) {}

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
