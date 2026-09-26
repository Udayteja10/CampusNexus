package com.campusnexus.dto;

public record HtnoValidationResponse(
        String htno,
        boolean valid,
        boolean available,
        Integer admissionYear,
        Integer yearOfStudy,
        String regulation,
        String department,
        String email,
        String message
) {
}
