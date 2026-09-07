package com.dada_labs_two.chamavault.chama.constants;

public enum ChamaPurpose {
    POOLING,
    MERRY_GO_ROUND,
    BOTH;

    public boolean supportsPooling() {
        return this == POOLING || this == BOTH;
    }

    public boolean supportsMerryGoRound() {
        return this == MERRY_GO_ROUND || this == BOTH;
    }
}
