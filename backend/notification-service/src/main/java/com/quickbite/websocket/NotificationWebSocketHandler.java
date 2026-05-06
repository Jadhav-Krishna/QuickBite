package com.quickbite.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    // Maps userId to list of active WebSocket sessions
    private final Map<Long, CopyOnWriteArrayList<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (session == null) {
            return;
        }
        
        java.net.URI uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        
        String query = uri.getQuery();
        Long userId = extractUserId(query);

        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(session);
            log.info("WebSocket connection established for user: {}", userId);
            
            // Send connection confirmation
            session.sendMessage(new TextMessage("{\"type\":\"CONNECTED\", \"userId\":" + userId + "}"));
        } else {
            log.warn("WebSocket connection without userId, closing");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        if (session == null) {
            return;
        }
        
        java.net.URI uri = session.getUri();
        if (uri == null) {
            return;
        }
        
        String query = uri.getQuery();
        Long userId = extractUserId(query);

        if (userId != null && userSessions.containsKey(userId)) {
            userSessions.get(userId).remove(session);
            if (userSessions.get(userId).isEmpty()) {
                userSessions.remove(userId);
            }
            log.info("WebSocket connection closed for user: {}", userId);
        }
    }

    /**
     * Broadcast notification to specific user
     */
    public void sendNotificationToUser(Long userId, Object notification) {
        CopyOnWriteArrayList<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            sendToSessions(sessions, notification);
            log.info("Notification sent to user {} via {} session(s)", userId, sessions.size());
        } else {
            log.debug("No active WebSocket sessions for user: {}", userId);
        }
    }

    /**
     * Broadcast notification to multiple users
     */
    public void sendNotificationToUsers(Iterable<Long> userIds, Object notification) {
        for (Long userId : userIds) {
            sendNotificationToUser(userId, notification);
        }
    }

    private Long extractUserId(String query) {
        if (query == null || query.isEmpty()) return null;
        
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] keyVal = pair.split("=");
            if (keyVal.length == 2 && "userId".equals(keyVal[0])) {
                try {
                    return Long.parseLong(keyVal[1]);
                } catch (NumberFormatException e) {
                    log.warn("Invalid userId format: {}", keyVal[1]);
                    return null;
                }
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
                    sendMessageToSession(session, textMessage);
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize notification payload: {}", e.getMessage());
        }
    }

    private void sendMessageToSession(WebSocketSession session, TextMessage textMessage) {
        try {
            session.sendMessage(textMessage);
        } catch (IOException e) {
            log.error("Failed to send message to session: {}", e.getMessage());
        }
    }

    public int getActiveConnectionCount() {
        return userSessions.values().stream()
                .mapToInt(CopyOnWriteArrayList::size)
                .sum();
    }

    public int getConnectedUserCount() {
        return userSessions.size();
    }
}
