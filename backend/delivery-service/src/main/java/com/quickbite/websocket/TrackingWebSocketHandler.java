package com.quickbite.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class TrackingWebSocketHandler extends TextWebSocketHandler {

    // Maps an orderId/deliveryId to a list of active WebSocket sessions
    private final Map<String, CopyOnWriteArrayList<WebSocketSession>> sessionsMap = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri() != null ? session.getUri().getQuery() : "";
        String orderId = extractOrderId(query);

        if (orderId != null && !orderId.isEmpty()) {
            sessionsMap.computeIfAbsent(orderId, k -> new CopyOnWriteArrayList<>()).add(session);
            // Optional: send an initial "CONNECTED" message
            session.sendMessage(new TextMessage("{\"type\":\"CONNECTED\", \"orderId\":\"" + orderId + "\"}"));
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String query = session.getUri() != null ? session.getUri().getQuery() : "";
        String orderId = extractOrderId(query);

        if (orderId != null && sessionsMap.containsKey(orderId)) {
            sessionsMap.get(orderId).remove(session);
            if (sessionsMap.get(orderId).isEmpty()) {
                sessionsMap.remove(orderId);
            }
        }
    }

    public void broadcastLocation(String orderId, Object payload) {
        CopyOnWriteArrayList<WebSocketSession> sessions = sessionsMap.get(orderId);
        if (sessions != null && !sessions.isEmpty()) {
            sendToSessions(sessions, payload);
        }
    }

    public void broadcastStatus(String orderId, Object payload) {
        CopyOnWriteArrayList<WebSocketSession> sessions = sessionsMap.get(orderId);
        if (sessions != null && !sessions.isEmpty()) {
            sendToSessions(sessions, Map.of("type", "DELIVERY_STATUS", "payload", payload));
        }
    }

    private String extractOrderId(String query) {
        if (query == null) return null;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] keyVal = pair.split("=");
            if (keyVal.length == 2 && "orderId".equals(keyVal[0])) {
                return keyVal[1];
            }
        }
        return null;
    }

    private void sendToSessions(CopyOnWriteArrayList<WebSocketSession> sessions, Object payload) {
        try {
            String message = objectMapper.writeValueAsString(payload);
            TextMessage textMessage = new TextMessage(message);
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(textMessage);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
