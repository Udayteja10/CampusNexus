package com.campusnexus.exception;

public class EmailDeliveryException extends RuntimeException {

    public enum FailureReason {
        NOT_CONFIGURED,
        CONNECTION_FAILURE,
        AUTHENTICATION_FAILURE,
        RECIPIENT_REJECTED,
        MESSAGE_CONSTRUCTION_ERROR,
        TRANSPORT_ERROR
    }

    private final FailureReason reason;

    public EmailDeliveryException(String message, FailureReason reason) {
        super(message);
        this.reason = reason;
    }

    public EmailDeliveryException(String message, Throwable cause, FailureReason reason) {
        super(message, cause);
        this.reason = reason;
    }

    public FailureReason getReason() {
        return reason;
    }
}
