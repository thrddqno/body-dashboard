package com.antonio.bodydashboard.exception;

public class AiProviderException extends RuntimeException {

    private final FailureReason reason;
    private final Integer upstreamStatus;

    public AiProviderException(String message, Throwable cause) {
        this(message, cause, FailureReason.UNAVAILABLE, null);
    }

    public AiProviderException(
            String message,
            Throwable cause,
            FailureReason reason,
            Integer upstreamStatus) {
        super(message, cause);
        this.reason = reason;
        this.upstreamStatus = upstreamStatus;
    }

    public FailureReason getReason() {
        return reason;
    }

    public Integer getUpstreamStatus() {
        return upstreamStatus;
    }

    public enum FailureReason {
        RATE_LIMITED,
        REJECTED,
        INVALID_RESPONSE,
        UNAVAILABLE
    }
}
