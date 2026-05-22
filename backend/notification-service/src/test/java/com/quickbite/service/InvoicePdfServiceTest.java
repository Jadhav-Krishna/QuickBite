package com.quickbite.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class InvoicePdfServiceTest {

    private final InvoicePdfService service = new InvoicePdfService();

    @Test
    void renderPdf_success() {
        byte[] pdf = service.renderInvoicePdf("<html><body>Test</body></html>");

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void renderPdf_invalidInput(String html) {
        byte[] pdf = service.renderInvoicePdf(html);

        assertEquals(0, pdf.length);
    }
}