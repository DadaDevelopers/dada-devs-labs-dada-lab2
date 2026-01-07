package com.dada_labs_two.chamavault.users.constants;

public enum Activity {
    STARTED,        // Actively running
    PAUSED,         // Temporarily halted
    BLOCKED,        // Cannot proceed due to dependency
    CANCELLED,      // Stopped intentionally
    COMPLETED,      // Finished successfully
    /* ───── Lifecycle ───── */
    CREATED,            // Account created but not yet verified
    VERIFIED,           // Email/identity verified
    ACTIVATED,          // Fully active and usable
    DEACTIVATED,        // User deactivated account
    CLOSED,             // Permanently closed (terminal)
    USER_REQUEST_ACCEPTED,
    USER_REQUEST_REJECTED,
    USER_REQUEST_DELETION,
    USER_REQUEST_RESET,
    REPORTED_FOR_INVESTIGATION,
    REPORTED_FOR_HARASSMENT,

    /* ───── Session / Usage ───── */
    LOGGED_IN,
    LOGGED_OUT,
    IDLE,               // No activity detected
    WAITING,            // Awaiting user/system action

    /* ───── Suspension & Restrictions ───── */
    SUSPENDED,          // Temporarily disabled by system/admin
    LOCKED,             // Locked due to security policy (e.g. failed logins)
    RESTRICTED,         // Limited functionality
    FROZEN,             // Compliance/legal hold

    /* ───── Recovery & Resumption ───── */
    RESUMED,            // Restored from suspended state,Continued after pause
    UNLOCKED,           // Security lock removed
    REACTIVATED,        // Account re-enabled after deactivation

    /* ───── Risk & Alerts ───── */
    WARNING,            // Policy or security warning
    FLAGGED,            // Marked for review
    UNDER_REVIEW,       // Manual or automated review ongoing

    /* ───── Security Events ───── */
    PASSWORD_RESET,
    MFA_ENABLED,
    MFA_DISABLED,
    CREDENTIALS_UPDATED,

    /* ───── Compliance / Enforcement ───── */
    VIOLATION_DETECTED,
    PENALIZED,
    BANNED,             // Permanent enforcement action (terminal)

    /* ───── Failure / Errors ───── */
    FAILED,             // Operation failed
    TIMEOUT             // Action timed out, Stopped due to time limit
}
