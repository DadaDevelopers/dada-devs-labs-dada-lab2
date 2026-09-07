package com.dada_labs_two.chamavault.governance.controllers;

import com.dada_labs_two.chamavault.governance.models.GovernanceRequest;
import com.dada_labs_two.chamavault.governance.services.GovernanceService;
import com.dada_labs_two.chamavault.governance.dtos.CastVoteRequest;
import com.dada_labs_two.chamavault.governance.dtos.CreateGovernanceRequest;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chamas/{chamaId}/governance")
public class GovernanceController {
 private final GovernanceService governanceService;

 @PostMapping("/requests")
 public ResponseEntity<GovernanceRequest> create(@PathVariable UUID chamaId,
                                                 @AuthenticationPrincipal User user,
                                                 @Valid @RequestBody CreateGovernanceRequest request){
  return ResponseEntity.ok(
          governanceService.create(chamaId,user,request)
  ); }

 @GetMapping("/requests")
 public ResponseEntity<Page<GovernanceRequest>> list(@PathVariable UUID chamaId,
                                                     @AuthenticationPrincipal User user,
                                                     Pageable pageable) {
  return ResponseEntity.ok(governanceService.list(chamaId,user,pageable));
 }
 @PostMapping("/requests/{requestId}/votes")
 public ResponseEntity<GovernanceRequest> vote(@PathVariable UUID chamaId,
                                               @PathVariable UUID requestId,
                                               @AuthenticationPrincipal User user,
                                               @Valid @RequestBody CastVoteRequest vote) {
   return ResponseEntity.ok(governanceService.vote(chamaId,requestId,user,vote));
 }

}
