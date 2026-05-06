package com.quickbite.controller;

import com.quickbite.dto.*;
import com.quickbite.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Test
    void initiatePayment_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(1L)
                .amount(BigDecimal.valueOf(100))
                .status("PENDING")
                .build();

        when(paymentService.initiatePayment(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":1,\"customerId\":1,\"amount\":100,\"currency\":\"INR\",\"paymentMethod\":\"UPI\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(1));
    }

    @Test
    void verifyPayment_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("SUCCESS")
                .build();

        when(paymentService.verifyPayment(any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/verify")
                        .param("paymentId", "pay_123")
                        .param("signature", "sig_123")
                        .param("orderId", "order_123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void markPaymentFailed_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("FAILED")
                .build();

        when(paymentService.markPaymentFailed(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/fail")
                        .param("orderId", "order_123")
                        .param("reason", "Payment failed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FAILED"));
    }

    @Test
    void getPaymentByOrderId_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .orderId(1L)
                .build();

        when(paymentService.getPaymentByOrderId(any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/payments/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1));
    }

    @Test
    void refundPayment_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("REFUNDED")
                .build();

        when(paymentService.refundPayment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/refund/1")
                        .param("reason", "Customer request"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    @Test
    void handleWebhook_success() throws Exception {
        doNothing().when(paymentService).handleWebhookEvent(any());

        mockMvc.perform(post("/api/v1/payments/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"event\":\"payment.authorized\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    void getWalletBalance_success() throws Exception {
        WalletResponse response = WalletResponse.builder()
                .walletId(1L)
                .customerId(1L)
                .balance(BigDecimal.valueOf(200))
                .build();

        when(paymentService.getWalletBalance(any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/payments/wallet/balance/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(200));
    }

    @Test
    void depositToWallet_success() throws Exception {
        WalletResponse response = WalletResponse.builder()
                .walletId(1L)
                .customerId(1L)
                .balance(BigDecimal.valueOf(250))
                .build();

        when(paymentService.addToWallet(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/wallet/deposit")
                        .param("customerId", "1")
                        .param("amount", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(250));
    }

    @Test
    void payFromWallet_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("SUCCESS")
                .build();

        when(paymentService.payFromWallet(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/wallet/pay")
                        .param("customerId", "1")
                        .param("orderId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void payAmountFromWallet_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("SUCCESS")
                .build();

        when(paymentService.payAmountFromWallet(any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/wallet/pay-amount")
                        .param("customerId", "1")
                        .param("amount", "50")
                        .param("description", "Test payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void getWalletStatements_success() throws Exception {
        WalletStatementDTO statement = WalletStatementDTO.builder()
                .id(1L)
                .walletId(1L)
                .type("CREDIT")
                .amount(BigDecimal.valueOf(50))
                .build();

        when(paymentService.getWalletStatements(any())).thenReturn(List.of(statement));

        mockMvc.perform(get("/api/v1/payments/wallet/statements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("CREDIT"));
    }

    @Test
    void getCustomerPayments_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .customerId(1L)
                .build();

        when(paymentService.getPaymentsByCustomer(any())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/payments/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerId").value(1));
    }

    @Test
    void getAllPayments_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .build();

        when(paymentService.getAllPayments()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].paymentId").value(1));
    }

    @Test
    void updatePaymentStatus_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("SUCCESS")
                .build();

        when(paymentService.updatePaymentStatus(any(), any())).thenReturn(response);

        mockMvc.perform(put("/api/v1/payments/1/status")
                        .param("status", "SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    void createCODPayment_success() throws Exception {
        PaymentResponse response = PaymentResponse.builder()
                .paymentId(1L)
                .status("PENDING")
                .build();

        when(paymentService.createCODPayment(any(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/cod")
                        .param("orderId", "1")
                        .param("customerId", "1")
                        .param("amount", "100"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
