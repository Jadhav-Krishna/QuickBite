package com.quickbite.controller;

import com.quickbite.dto.PaymentRequest;
import com.quickbite.dto.PaymentResponse;
import com.quickbite.dto.RazorpayWebhookEvent;
import com.quickbite.service.PaymentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(@Valid @RequestBody PaymentRequest request) {
        log.info("Initiating payment for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("signature") String signature,
            @RequestParam("orderId") String orderId) {
        log.info("Verifying payment: {}", paymentId);
        PaymentResponse response = paymentService.verifyPayment(paymentId, signature, orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable("orderId") Long orderId) {
        log.info("Fetching payment for order: {}", orderId);
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund/{paymentId}")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable("paymentId") Long paymentId,
            @RequestParam("reason") String reason) {
        log.info("Processing refund for payment: {}", paymentId);
        PaymentResponse response = paymentService.refundPayment(paymentId, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(@RequestBody RazorpayWebhookEvent event) {
        log.info("Received webhook event: {}", event.getEvent());
        try {
            paymentService.handleWebhookEvent(event);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== Wallet Endpoints ====================

    @GetMapping("/wallet/balance/{customerId}")
    public ResponseEntity<com.quickbite.dto.WalletResponse> getWalletBalance(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(paymentService.getWalletBalance(customerId));
    }

    @PostMapping("/wallet/deposit")
    public ResponseEntity<com.quickbite.dto.WalletResponse> depositToWallet(
            @RequestParam("customerId") Long customerId,
            @RequestParam("amount") BigDecimal amount) {
        log.info("Depositing {} to wallet for customer: {}", amount, customerId);
        return ResponseEntity.ok(paymentService.addToWallet(customerId, amount));
    }

    @PostMapping("/wallet/pay")
    public ResponseEntity<PaymentResponse> payFromWallet(
            @RequestParam("customerId") Long customerId,
            @RequestParam("orderId") Long orderId) {
        log.info("Paying from wallet for order: {} by customer: {}", orderId, customerId);
        return ResponseEntity.ok(paymentService.payFromWallet(customerId, orderId));
    }

    @GetMapping("/wallet/statements/{customerId}")
    public ResponseEntity<List<com.quickbite.dto.WalletStatementDTO>> getWalletStatements(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(paymentService.getWalletStatements(customerId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponse>> getCustomerPayments(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomer(customerId));
    }
}
