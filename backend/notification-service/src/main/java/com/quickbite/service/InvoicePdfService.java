package com.quickbite.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@Slf4j
public class InvoicePdfService {

    public byte[] renderInvoicePdf(String htmlContent) {
        if (htmlContent == null || htmlContent.isBlank()) {
            return new byte[0];
        }

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.toStream(outputStream);
            builder.withHtmlContent(htmlContent, null);
            builder.useFastMode();
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to render invoice PDF: {}", e.getMessage());
            return new byte[0];
        }
    }
}

