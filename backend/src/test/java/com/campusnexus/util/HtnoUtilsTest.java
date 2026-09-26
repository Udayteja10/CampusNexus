package com.campusnexus.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HtnoUtilsTest {

    @ParameterizedTest
    @CsvSource({
            "23R21A0501, 2023, 4, R21, CSE, 23r21a0501@mlrit.ac.in",
            "24R25A0402, 2024, 3, R25, ECE, 24r25a0402@mlrit.ac.in",
            "25R25A0203, 2025, 2, R25, EEE, 25r25a0203@mlrit.ac.in",
            "26R25A0304, 2026, 1, R25, MECH, 26r25a0304@mlrit.ac.in",
            "23R21A0105, 2023, 4, R21, CIVIL, 23r21a0105@mlrit.ac.in",
            "24R25A1206, 2024, 3, R25, IT, 24r25a1206@mlrit.ac.in",
            "25R25A6607, 2025, 2, R25, CSM, 25r25a6607@mlrit.ac.in",
            "26R25A6708, 2026, 1, R25, CSD, 26r25a6708@mlrit.ac.in",
            "23R21A3309, 2023, 4, R21, CSIT, 23r21a3309@mlrit.ac.in"
    })
    @DisplayName("Should successfully parse valid institutional HTNOs across cohorts and departments")
    void shouldParseValidHtno(
            String rawHtno,
            int expectedAdmissionYear,
            int expectedYearOfStudy,
            String expectedRegulation,
            String expectedDept,
            String expectedEmail
    ) {
        HtnoUtils.HtnoMetadata meta = HtnoUtils.parseAndValidate(rawHtno);
        assertThat(meta.htno()).isEqualTo(rawHtno.toUpperCase());
        assertThat(meta.admissionYear()).isEqualTo(expectedAdmissionYear);
        assertThat(meta.yearOfStudy()).isEqualTo(expectedYearOfStudy);
        assertThat(meta.regulation()).isEqualTo(expectedRegulation);
        assertThat(meta.departmentCode()).isEqualTo(expectedDept);
        assertThat(meta.institutionalEmail()).isEqualTo(expectedEmail);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "22R21A0501", // Unsupported admission year 22
            "27R25A0501", // Unsupported admission year 27
            "23R21A9901", // Unsupported department branch code 99
            "INVALID_HTNO",
            "23R210501",  // Missing section code
            "23R21A05",    // Missing sequence number
            "",
            "   "
    })
    @DisplayName("Should reject invalid or unsupported HTNOs")
    void shouldRejectInvalidHtno(String invalidHtno) {
        assertThatThrownBy(() -> HtnoUtils.parseAndValidate(invalidHtno))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Normalizing should trim and uppercase")
    void shouldNormalizeCorrectly() {
        assertThat(HtnoUtils.normalize("  23r21a0501  ")).isEqualTo("23R21A0501");
        assertThat(HtnoUtils.normalize(null)).isNull();
        assertThat(HtnoUtils.normalize("  ")).isNull();
    }
}
