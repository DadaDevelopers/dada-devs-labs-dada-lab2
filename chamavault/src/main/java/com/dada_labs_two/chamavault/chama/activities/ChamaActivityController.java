package com.dada_labs_two.chamavault.chama.activities;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.ZonedDateTime;
import java.util.UUID;
@RestController @RequiredArgsConstructor @RequestMapping("/chamas/{chamaId}/activities")
public class ChamaActivityController {
 private final ChamaActivityService service;
 @GetMapping public ResponseEntity<Page<ChamaActivityDTO>> list(@PathVariable UUID chamaId,@AuthenticationPrincipal User user,
  @RequestParam(required=false) ActivityCategory category,@RequestParam(required=false) ChamaActivityType activityType,
  @RequestParam(required=false) UUID actorUserReference,
  @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) ZonedDateTime from,
  @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) ZonedDateTime to,
  Pageable page){return ResponseEntity.ok(service.list(chamaId,user,category,activityType,actorUserReference,from,to,page));}
 @GetMapping("/{activityId}") public ResponseEntity<ChamaActivityDTO> get(@PathVariable UUID chamaId,@PathVariable UUID activityId,
  @AuthenticationPrincipal User user){return ResponseEntity.ok(service.get(chamaId,activityId,user));}
}
