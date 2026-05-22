package com.quickbite.repository;

import com.quickbite.entity.Payment;
import com.quickbite.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByCustomerId(Long customerId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByCustomerIdAndStatus(Long customerId, PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.createdAt >= :fromDate")
    List<Payment> findPaymentsByStatusAndDate(
            @Param("status") PaymentStatus status,
            @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'SUCCESS' AND p.customerId = :customerId")
    long countSuccessfulPaymentsByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND p.createdAt >= :fromDate AND p.createdAt <= :toDate")
    Double getTotalAmountByDateRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    boolean existsByRazorpayPaymentIdAndRazorpaySignature(String razorpayPaymentId, String razorpaySignature);
}