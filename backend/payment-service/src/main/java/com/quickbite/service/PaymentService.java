package com.quickbite.service;

import com.quickbite.dto.PaymentRequest;
import com.quickbite.dto.PaymentResponse;
import com.quickbite.dto.RazorpayWebhookEvent;
import java.util.List;

public interface PaymentService {

    PaymentResponse initiatePayment(PaymentRequest request);

    PaymentResponse verifyPayment(String paymentId, String signature, String orderId);

    PaymentResponse markPaymentFailed(String razorpayOrderId, String reason);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse refundPayment(Long paymentId, String reason);

    void handleWebhookEvent(RazorpayWebhookEvent event);

    // Wallet operations
    com.quickbite.dto.WalletResponse getWalletBalance(Long customerId);
    
    com.quickbite.dto.WalletResponse addToWallet(Long customerId, java.math.BigDecimal amount);

    PaymentResponse payAmountFromWallet(Long customerId, java.math.BigDecimal amount, String description);
    
    PaymentResponse payFromWallet(Long customerId, Long orderId);
    
    java.util.List<com.quickbite.dto.WalletStatementDTO> getWalletStatements(Long customerId);
    
    java.util.List<PaymentResponse> getPaymentsByCustomer(Long customerId);

    List<PaymentResponse> getAllPayments();
}
