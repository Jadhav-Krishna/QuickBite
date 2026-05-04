package com.quickbite.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InvoicePdfServiceTest {

    private final InvoicePdfService service = new InvoicePdfService();

    @Test
    void renderPdf_success() {
        byte[] pdf = service.renderInvoicePdf("<html><body>Test</body></html>");

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void renderPdf_empty() {
        byte[] pdf = service.renderInvoicePdf("");

        assertEquals(0, pdf.length);
    }

    @Test
    void renderPdf_null() {
        byte[] pdf = service.renderInvoicePdf(null);

        assertEquals(0, pdf.length);
    }

    @Test
    void renderPdf_blank() {
        byte[] pdf = service.renderInvoicePdf("   ");

        assertEquals(0, pdf.length);
    }
}