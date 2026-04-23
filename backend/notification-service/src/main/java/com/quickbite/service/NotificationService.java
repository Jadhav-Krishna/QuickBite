package com.quickbite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.quickbite.entity.Notification;
import com.quickbite.event.NotificationEvent;
import com.quickbite.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${internal.api.base-url:http://gateway:8000/api}")
    private String internalApiBaseUrl;

    public void processNotification(NotificationEvent event) {
        log.info("Processing notification event: {}", event.getEventType());

        if (event.getUserId() != null || event.getCustomerId() != null) {
            Long userId = event.getUserId() != null ? event.getUserId() : event.getCustomerId();
            saveInAppNotification(
                    userId,
                    event.getTitle() != null ? event.getTitle() : "New Notification",
                    event.getMessage(),
                    event.getEventType(),
                    event.getOrderId()
            );
        }

        if (event.getRecipientEmail() != null && !event.getRecipientEmail().isEmpty()) {
            String subject = event.getTitle() != null ? event.getTitle() : "QuickBite Update";
            emailService.sendEmail(event.getRecipientEmail(), subject, event.getMessage());
        }

        if (event.getRecipientPhone() != null && !event.getRecipientPhone().isEmpty()) {
            smsService.sendSms(event.getRecipientPhone(), event.getMessage());
        }
    }

    public void processOrderEvent(Map<String, Object> eventData) {
        String eventType = stringValue(eventData.get("eventType"));
        String orderNumber = stringValue(eventData.get("orderNumber"));
        Long orderId = longValue(eventData.get("orderId"));
        Long customerId = longValue(eventData.get("customerId"));
        Long restaurantId = longValue(eventData.get("restaurantId"));

        if (eventType == null || orderNumber == null) {
            log.warn("Skipping malformed order event: {}", eventData);
            return;
        }

        JsonNode order = fetchJson("/v1/orders/" + orderNumber);
        if (order == null || order.isMissingNode()) {
            log.warn("Unable to fetch order details for orderNumber={}", orderNumber);
            return;
        }

        if (customerId == null || customerId == 0) {
            customerId = asLong(order, "customerId");
        }
        if (restaurantId == null || restaurantId == 0) {
            restaurantId = asLong(order, "restaurantId");
        }

        Long deliveryAgentId = asLong(order, "deliveryAgentId");

        JsonNode customer = customerId != null ? fetchJson("/auth/user/" + customerId) : null;
        JsonNode restaurant = restaurantId != null ? fetchJson("/v1/restaurants/" + restaurantId) : null;

        Long ownerId = asLong(restaurant, "ownerId");
        JsonNode owner = ownerId != null ? fetchJson("/auth/user/" + ownerId) : null;
        JsonNode agent = deliveryAgentId != null ? fetchJson("/v1/delivery/agents/" + deliveryAgentId) : null;

        Long agentUserId = asLong(agent, "userId");

        String customerMessage = customerOrderMessage(eventType, orderNumber);
        String ownerMessage = ownerOrderMessage(eventType, orderNumber);
        String agentMessage = agentOrderMessage(eventType, orderNumber);

        if (customerId != null && customerMessage != null) {
            saveInAppNotification(customerId, "Order Update", customerMessage, eventType, orderId);
        }

        if (ownerId != null && ownerMessage != null) {
            saveInAppNotification(ownerId, "Restaurant Order Update", ownerMessage, eventType, orderId);
        }

        if (agentUserId != null && agentMessage != null) {
            saveInAppNotification(agentUserId, "Delivery Update", agentMessage, eventType, orderId);
        }

        if ("ORDER_DELIVERED".equalsIgnoreCase(eventType)) {
            sendInvoiceEmails(order, customer, owner, agent, restaurant);
        } else {
            String customerEmail = asText(customer, "email");
            String ownerEmail = asText(owner, "email");
            String agentEmail = asText(agent, "email");

            if (customerMessage != null && customerEmail != null) {
                emailService.sendEmail(customerEmail, "QuickBite Order " + orderNumber, customerMessage);
            }
            if (ownerMessage != null && ownerEmail != null) {
                emailService.sendEmail(ownerEmail, "QuickBite Restaurant Alert " + orderNumber, ownerMessage);
            }
            if (agentMessage != null && agentEmail != null) {
                emailService.sendEmail(agentEmail, "QuickBite Delivery Alert " + orderNumber, agentMessage);
            }
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private void saveInAppNotification(Long userId, String title, String message, String eventType, Long referenceId) {
        if (userId == null || message == null || message.isBlank()) return;

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type("IN_APP")
                .eventType(eventType != null ? eventType : "GENERAL")
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    private JsonNode fetchJson(String relativePath) {
        try {
            String url = internalApiBaseUrl + relativePath;
            String response = restTemplate.getForObject(url, String.class);
            if (response == null || response.isBlank()) return null;
            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.warn("Failed to fetch {}: {}", relativePath, e.getMessage());
            return null;
        }
    }

    private void sendInvoiceEmails(JsonNode order, JsonNode customer, JsonNode owner, JsonNode agent, JsonNode restaurant) {
        String orderNumber = asText(order, "orderNumber");
        String qrPayload = "QB|" + orderNumber + "|" + asText(order, "finalAmount") + "|" + LocalDateTime.now();
        String qrBase64 = generateQrBase64(qrPayload);
        String safeOrderNumber = orderNumber != null ? orderNumber : "quickbite-order";

        String customerEmail = asText(customer, "email");
        String ownerEmail = asText(owner, "email");
        String agentEmail = asText(agent, "email");

        if (customerEmail != null) {
            String html = buildInvoiceHtml("Customer Copy", order, restaurant, customer, agent, qrBase64);
            byte[] pdf = invoicePdfService.renderInvoicePdf(html);
            emailService.sendHtmlEmailWithAttachment(
                    customerEmail,
                    "QuickBite Invoice - " + safeOrderNumber,
                    html,
                    "invoice-" + safeOrderNumber + "-customer.pdf",
                    pdf
            );
        }

        if (ownerEmail != null) {
            String html = buildInvoiceHtml("Restaurant Copy", order, restaurant, customer, agent, qrBase64);
            byte[] pdf = invoicePdfService.renderInvoicePdf(html);
            emailService.sendHtmlEmailWithAttachment(
                    ownerEmail,
                    "QuickBite Invoice (Restaurant) - " + safeOrderNumber,
                    html,
                    "invoice-" + safeOrderNumber + "-restaurant.pdf",
                    pdf
            );
        }

        if (agentEmail != null) {
            String html = buildInvoiceHtml("Delivery Copy", order, restaurant, customer, agent, qrBase64);
            byte[] pdf = invoicePdfService.renderInvoicePdf(html);
            emailService.sendHtmlEmailWithAttachment(
                    agentEmail,
                    "QuickBite Invoice (Delivery) - " + safeOrderNumber,
                    html,
                    "invoice-" + safeOrderNumber + "-delivery.pdf",
                    pdf
            );
        }
    }

    private String buildInvoiceHtml(String copyLabel, JsonNode order, JsonNode restaurant, JsonNode customer, JsonNode agent, String qrBase64) {
        String orderNumber = safe(asText(order, "orderNumber"));
        String customerName = safe(asText(customer, "fullName"));
        String customerPhone = safe(asText(order, "customerPhone"));
        String deliveryAddress = safe(asText(order, "deliveryAddress"));
        String restaurantName = safe(asText(restaurant, "name"));
        String restaurantAddress = safe(asText(restaurant, "address"));
        String restaurantImage = asText(restaurant, "imageUrl");
        String agentName = safe(asText(agent, "fullName"));
        String paymentMethod = safe(asText(order, "paymentMethod"));
        String subtotal = safe(asText(order, "totalAmount"));
        String deliveryCharge = safe(asText(order, "deliveryCharge"));
        String discount = safe(asText(order, "discountAmount"));
        String finalAmount = safe(asText(order, "finalAmount"));

        String billedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        StringBuilder itemsHtml = new StringBuilder();
        JsonNode items = order.path("items");
        if (items.isArray()) {
            for (JsonNode item : items) {
                String name = safe(asText(item, "itemName"));
                int qty = item.path("quantity").asInt(1);
                double price = item.path("price").asDouble(0.0);
                double lineTotal = qty * price;
                itemsHtml.append("<tr>")
                        .append("<td style='padding:8px 0;'>").append(name).append("</td>")
                        .append("<td style='padding:8px 0;text-align:center;'>").append(qty).append("</td>")
                        .append("<td style='padding:8px 0;text-align:right;'>Rs ").append(String.format("%.2f", lineTotal)).append("</td>")
                        .append("</tr>");
            }
        }

        String restaurantImageHtml = (restaurantImage != null && !restaurantImage.isBlank())
                ? "<img src='" + restaurantImage + "' alt='Restaurant' style='width:100%;max-height:180px;object-fit:cover;border-radius:12px;margin-top:12px;'/>"
                : "";

        return """
                <div style='font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;color:#1f2937;'>
                  <h2 style='margin:0;color:#dc2626;'>QuickBite Invoice</h2>
                  <p style='margin:6px 0 14px;font-size:12px;color:#6b7280;'>%s</p>
                  <div style='display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;'>
                    <div>
                      <p style='margin:0;font-size:13px;'><strong>Order:</strong> %s</p>
                      <p style='margin:4px 0;font-size:13px;'><strong>Billed At:</strong> %s</p>
                      <p style='margin:4px 0;font-size:13px;'><strong>Payment:</strong> %s</p>
                    </div>
                    <div style='text-align:right;'>
                      <img src='data:image/png;base64,%s' alt='Invoice QR' style='width:110px;height:110px;border:1px solid #d1d5db;border-radius:10px;padding:6px;background:#fff;' />
                    </div>
                  </div>
                  <hr style='border:none;border-top:1px solid #e5e7eb;margin:16px 0;' />

                  <h3 style='margin:0 0 8px;font-size:15px;'>Restaurant</h3>
                  <p style='margin:0;font-size:13px;'><strong>%s</strong></p>
                  <p style='margin:4px 0 8px;font-size:13px;color:#4b5563;'>%s</p>
                  %s

                  <h3 style='margin:16px 0 8px;font-size:15px;'>Delivery</h3>
                  <p style='margin:0;font-size:13px;'><strong>Customer:</strong> %s (%s)</p>
                  <p style='margin:4px 0;font-size:13px;'><strong>Address:</strong> %s</p>
                  <p style='margin:4px 0;font-size:13px;'><strong>Delivery Agent:</strong> %s</p>

                  <h3 style='margin:16px 0 8px;font-size:15px;'>Items</h3>
                  <table style='width:100%%;border-collapse:collapse;font-size:13px;'>
                    <thead>
                      <tr>
                        <th style='text-align:left;border-bottom:1px solid #e5e7eb;padding-bottom:6px;'>Item</th>
                        <th style='text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:6px;'>Qty</th>
                        <th style='text-align:right;border-bottom:1px solid #e5e7eb;padding-bottom:6px;'>Total</th>
                      </tr>
                    </thead>
                    <tbody>%s</tbody>
                  </table>

                  <div style='margin-top:16px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;'>
                    <p style='margin:4px 0;font-size:13px;'><strong>Subtotal:</strong> Rs %s</p>
                    <p style='margin:4px 0;font-size:13px;'><strong>Delivery Charge:</strong> Rs %s</p>
                    <p style='margin:4px 0;font-size:13px;'><strong>Discount:</strong> Rs %s</p>
                    <p style='margin:8px 0 0;font-size:15px;color:#111827;'><strong>Grand Total: Rs %s</strong></p>
                  </div>

                  <p style='margin-top:16px;font-size:12px;color:#6b7280;'>Thank you for using QuickBite. Keep this bill and QR for support, refunds, and verification.</p>
                </div>
                """.formatted(
                safe(copyLabel), safe(orderNumber), safe(billedAt), safe(paymentMethod), safe(qrBase64),
                safe(restaurantName), safe(restaurantAddress), restaurantImageHtml,
                safe(customerName), safe(customerPhone), safe(deliveryAddress), safe(agentName),
                itemsHtml, safe(subtotal), safe(deliveryCharge), safe(discount), safe(finalAmount)
        );
    }

    private String generateQrBase64(String payload) {
        try {
            BitMatrix matrix = new com.google.zxing.qrcode.QRCodeWriter()
                    .encode(payload, BarcodeFormat.QR_CODE, 240, 240);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate QR code: {}", e.getMessage());
            return Base64.getEncoder().encodeToString("QR unavailable".getBytes(StandardCharsets.UTF_8));
        }
    }

    private String customerOrderMessage(String eventType, String orderNumber) {
        return switch (eventType) {
            case "ORDER_PLACED" -> "Your order " + orderNumber + " has been placed successfully.";
            case "ORDER_CONFIRMED" -> "Restaurant accepted your order " + orderNumber + ".";
            case "ORDER_PREPARING" -> "Your order " + orderNumber + " is being prepared.";
            case "ORDER_READY" -> "Your order " + orderNumber + " is ready for pickup.";
            case "ORDER_PICKED_UP" -> "Delivery partner picked up your order " + orderNumber + ".";
            case "ORDER_IN_TRANSIT" -> "Your order " + orderNumber + " is on the way.";
            case "ORDER_DELIVERED" -> "Order " + orderNumber + " delivered. Invoice has been emailed.";
            case "ORDER_CANCELLED" -> "Order " + orderNumber + " has been cancelled.";
            default -> null;
        };
    }

    private String ownerOrderMessage(String eventType, String orderNumber) {
        return switch (eventType) {
            case "ORDER_PLACED" -> "New order " + orderNumber + " received. Please confirm and prepare.";
            case "ORDER_CONFIRMED" -> "Order " + orderNumber + " accepted by restaurant.";
            case "ORDER_READY" -> "Order " + orderNumber + " is ready and waiting for delivery partner.";
            case "ORDER_PICKED_UP" -> "Delivery partner picked up order " + orderNumber + ".";
            case "ORDER_DELIVERED" -> "Order " + orderNumber + " delivered successfully.";
            case "ORDER_CANCELLED" -> "Order " + orderNumber + " has been cancelled.";
            default -> null;
        };
    }

    private String agentOrderMessage(String eventType, String orderNumber) {
        return switch (eventType) {
            case "ORDER_READY" -> "Order " + orderNumber + " is ready for pickup.";
            case "ORDER_PICKED_UP" -> "Pickup confirmed for order " + orderNumber + ".";
            case "ORDER_IN_TRANSIT" -> "Order " + orderNumber + " is in transit.";
            case "ORDER_DELIVERED" -> "Order " + orderNumber + " delivered. Great job.";
            default -> null;
        };
    }

    private String safe(String value) {
        if (value == null) return "-";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String asText(JsonNode node, String field) {
        if (node == null || node.isMissingNode()) return null;
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) return null;
        String text = value.asText();
        return text.isBlank() ? null : text;
    }

    private Long asLong(JsonNode node, String field) {
        if (node == null || node.isMissingNode()) return null;
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) return null;
        long asLong = value.asLong(0);
        return asLong == 0 ? null : asLong;
    }

    private Long longValue(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (Exception ignored) {
            return null;
        }
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        String string = value.toString();
        return string.isBlank() ? null : string;
    }
}
