package com.dada_labs_two.chamavault.contributions.controllers;
import com.dada_labs_two.chamavault.contributions.models.PoolingCycle;
import com.dada_labs_two.chamavault.contributions.services.PoolingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController @RequiredArgsConstructor @RequestMapping("/chamas/{chamaId}/pooling-cycles")
public class PoolingCycleController {
 private final PoolingCycleService service;
 @GetMapping public ResponseEntity<Page<PoolingCycle>> list(@PathVariable UUID chamaId,Pageable pageable){return ResponseEntity.ok(service.list(chamaId,pageable));}
}
