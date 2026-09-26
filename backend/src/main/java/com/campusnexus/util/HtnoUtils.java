package com.campusnexus.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility functions for HTNO (Hall Ticket Number) normalization, validation,
 * and deterministic academic identity derivation.
 */
public final class HtnoUtils {

    public static final Pattern HTNO_PATTERN = Pattern.compile("^([0-9]{2})(R[0-9]{2})([A-Z])([0-9]{2})([A-Z0-9]{2,})$");
    public static final String INSTITUTIONAL_EMAIL_DOMAIN = "@mlrit.ac.in";

    private static final Map<String, Integer> ADMISSION_YEAR_MAP;
    private static final Map<Integer, Integer> YEAR_OF_STUDY_MAP;
    private static final Map<String, String> DEPARTMENT_CODE_MAP;

    static {
        Map<String, Integer> admMap = new HashMap<>();
        admMap.put("23", 2023);
        admMap.put("24", 2024);
        admMap.put("25", 2025);
        admMap.put("26", 2026);
        ADMISSION_YEAR_MAP = Collections.unmodifiableMap(admMap);

        Map<Integer, Integer> yosMap = new HashMap<>();
        yosMap.put(2023, 4);
        yosMap.put(2024, 3);
        yosMap.put(2025, 2);
        yosMap.put(2026, 1);
        YEAR_OF_STUDY_MAP = Collections.unmodifiableMap(yosMap);

        Map<String, String> deptMap = new HashMap<>();
        deptMap.put("05", "CSE");
        deptMap.put("04", "ECE");
        deptMap.put("02", "EEE");
        deptMap.put("03", "MECH");
        deptMap.put("01", "CIVIL");
        deptMap.put("12", "IT");
        deptMap.put("66", "CSM");
        deptMap.put("67", "CSD");
        deptMap.put("33", "CSIT");
        DEPARTMENT_CODE_MAP = Collections.unmodifiableMap(deptMap);
    }

    private HtnoUtils() {
        // Utility class
    }

    public record HtnoMetadata(
            String htno,
            Integer admissionYear,
            Integer yearOfStudy,
            String regulation,
            String departmentCode,
            String institutionalEmail
    ) {}

    /**
     * Deterministically normalizes an HTNO string.
     * Trims surrounding whitespace and converts ASCII characters to uppercase.
     */
    public static String normalize(String htno) {
        if (htno == null) {
            return null;
        }
        String trimmed = htno.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.toUpperCase();
    }

    /**
     * General structural bounds and alphanumeric check.
     */
    public static boolean isValid(String htno) {
        if (htno == null) {
            return true;
        }
        String normalized = normalize(htno);
        if (normalized == null) {
            return true;
        }
        if (normalized.length() > 20) {
            return false;
        }
        return normalized.matches("^[A-Z0-9]+$");
    }

    /**
     * Authoritatively parses and validates an institutional HTNO.
     * Throws IllegalArgumentException if malformed or containing unsupported metadata.
     */
    public static HtnoMetadata parseAndValidate(String rawHtno) {
        String normalized = normalize(rawHtno);
        if (normalized == null) {
            throw new IllegalArgumentException("HTNO cannot be blank.");
        }

        Matcher matcher = HTNO_PATTERN.matcher(normalized);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Invalid HTNO format. Must match standard institutional pattern (e.g., 23R21A0501).");
        }

        String yearPrefix = matcher.group(1);
        String regulation = matcher.group(2);
        // String collegeCode = matcher.group(3); // e.g. A
        String branchCode = matcher.group(4);

        Integer admissionYear = ADMISSION_YEAR_MAP.get(yearPrefix);
        if (admissionYear == null) {
            throw new IllegalArgumentException("Unsupported admission year prefix: " + yearPrefix);
        }

        Integer yearOfStudy = YEAR_OF_STUDY_MAP.get(admissionYear);
        if (yearOfStudy == null) {
            throw new IllegalArgumentException("Cannot determine year of study for admission year: " + admissionYear);
        }

        String departmentCode = DEPARTMENT_CODE_MAP.get(branchCode);
        if (departmentCode == null) {
            throw new IllegalArgumentException("Unsupported department branch code in HTNO: " + branchCode);
        }

        String institutionalEmail = normalized.toLowerCase() + INSTITUTIONAL_EMAIL_DOMAIN;

        return new HtnoMetadata(
                normalized,
                admissionYear,
                yearOfStudy,
                regulation,
                departmentCode,
                institutionalEmail
        );
    }
}
