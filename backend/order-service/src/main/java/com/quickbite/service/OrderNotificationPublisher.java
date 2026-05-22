package com.quickbite.service;

import com.quickbite.event.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OrderNotificationPublisher {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    private static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    private static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";
    
    @RabbitListener(queues = "order.queue")
    public void handleOrderEvent(OrderEvent event) {
        log.info("Received order event: {} for order: {}", event.getEventType(), event.getOrderNumber());
        
        try {
            // Send notification to customer
            sendNotificationToCustomer(event);
            
            // Send notification to restaurant for specific events
            if (shouldNotifyRestaurant(event.getEventType())) {
                sendNotificationToRestaurant(event);
            }
            
        } catch (Exception e) {
            log.error("Error handling order event for notifications: {}", e.getMessage(), e);
        }
    }
    
    private void sendNotificationToCustomer(OrderEvent event) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", event.getCustomerId());
        notification.put("title", getCustomerNotificationTitle(event.getEventType()));
        notification.put("message", getCustomerNotificationMessage(event));
        notification.put("type", getNotificationType(event.getEventType()));
        notification.put("eventType", event.getEventType());
        notification.put("referenceId", event.getOrderId());
        notification.put("sendEmail", shouldSendEmail(event.getEventType()));
        
        rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, notification);
        log.info("Notification sent to customer: {}", event.getCustomerId());
    }
    
    private void sendNotificationToRestaurant(OrderEvent event) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", event.getRestaurantId());
        notification.put("title", getRestaurantNotificationTitle(event.getEventType()));
        notification.put("message", getRestaurantNotificationMessage(event));
        notification.put("type", "INFO");
        notification.put("eventType", event.getEventType());
        notification.put("referenceId", event.getOrderId());
        notification.put("sendEmail", false);
        
        rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, notification);
        log.info("Notification sent to restaurant: {}", event.getRestaurantId());
    }
    
    private String getCustomerNotificationTitle(String eventType) {
        return switch (eventType) {
            case "ORDER_PLACED" -> "Order Placed Successfully";
            case "ORDER_CONFIRMED" -> "Order Confirmed";
            case "ORDER_PREPARING" -> "Order is Being Prepared";
            case "ORDER_READY" -> "Order is Ready";
            case "DELIVERY_AGENT_ASSIGNED" -> "Delivery Agent Assigned";
            case "ORDER_PICKED_UP" -> "Order Picked Up";
            case "ORDER_IN_TRANSIT" -> "Order is On the Way";
            case "ORDER_DELIVERED" -> "Order Delivered";
            case "ORDER_CANCELLED" -> "Order Cancelled";
            case "PAYMENT_SUCCESS" -> "Payment Successful";
            case "PAYMENT_FAILED" -> "Payment Failed";
            default -> "Order Update";
        };
    }
    
    private String getCustomerNotificationMessage(OrderEvent event) {
        return switch (event.getEventType()) {
            case "ORDER_PLACED" -> "Your order #" + event.getOrderNumber() + " has been placed successfully. Waiting for restaurant confirmation.";
            case "ORDER_CONFIRMED" -> "Your order #" + event.getOrderNumber() + " has been confirmed by the restaurant.";
            case "ORDER_PREPARING" -> "The restaurant is preparing your order #" + event.getOrderNumber() + ".";
            case "ORDER_READY" -> "Your order #" + event.getOrderNumber() + " is ready and waiting for pickup.";
            case "DELIVERY_AGENT_ASSIGNED" -> "A delivery agent has been assigned to your order #" + event.getOrderNumber() + ".";
            case "ORDER_PICKED_UP" -> "Your order #" + event.getOrderNumber() + " has been picked up by the delivery agent.";
            case "ORDER_IN_TRANSIT" -> "Your order #" + event.getOrderNumber() + " is on the way to your location.";
            case "ORDER_DELIVERED" -> "Your order #" + event.getOrderNumber() + " has been delivered. Enjoy your meal!";
            case "ORDER_CANCELLED" -> "Your order #" + event.getOrderNumber() + " has been cancelled.";
            case "PAYMENT_SUCCESS" -> "Payment of ₹" + event.getTotalAmount() + " for order #" + event.getOrderNumber() + " was successful.";
            case "PAYMENT_FAILED" -> "Payment for order #" + event.getOrderNumber() + " failed. Please try again.";
            default -> event.getMessage();
        };
    }
    
    private String getRestaurantNotificationTitle(String eventType) {
        return switch (eventType) {
            case "ORDER_PLACED" -> "New Order Received";
            case "ORDER_CONFIRMED" -> "Order Confirmed";
            case "ORDER_CANCELLED" -> "Order Cancelled";
            default -> "Order Update";
        };
    }
    
    private String getRestaurantNotificationMessage(OrderEvent event) {
        return switch (event.getEventType()) {
            case "ORDER_PLACED" -> "New order #" + event.getOrderNumber() + " received. Please confirm.";
            case "ORDER_CONFIRMED" -> "Order #" + event.getOrderNumber() + " confirmed. Start preparing.";
            case "ORDER_CANCELLED" -> "Order #" + event.getOrderNumber() + " has been cancelled.";
            default -> event.getMessage();
        };
    }
    
    private String getNotificationType(String eventType) {
        return switch (eventType) {
            case "ORDER_DELIVERED", "PAYMENT_SUCCESS" -> "SUCCESS";
            case "ORDER_CANCELLED", "PAYMENT_FAILED" -> "ERROR";
            case "ORDER_READY", "ORDER_PICKED_UP" -> "WARNING";
            default -> "INFO";
        };
    }
    
    private boolean shouldNotifyRestaurant(String eventType) {
        return eventType.equals("ORDER_PLACED") || 
               eventType.equals("ORDER_CONFIRMED") || 
               eventType.equals("ORDER_CANCELLED");
    }
    
    private boolean shouldSendEmail(String eventType) {
        // Only send email for order delivered
        return eventType.equals("ORDER_DELIVERED");
    }
}
