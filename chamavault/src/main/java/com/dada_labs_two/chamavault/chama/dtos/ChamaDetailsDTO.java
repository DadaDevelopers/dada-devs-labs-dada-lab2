package com.dada_labs_two.chamavault.chama.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaDetailsDTO {
    private ChamaDTO chama;
    private ChamaRulesDTO rules;
    private List<ChamaGroupWalletDTO> wallets = new ArrayList<>();
    private List<ChamaContributionCycleDTO>  contributionCycles = new ArrayList<>();
}
