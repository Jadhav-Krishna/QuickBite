package com.quickbite.websocket;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingWebSocketHandlerTest {

    private TrackingWebSocketHandler handler;
    private WebSocketSession session;

    @BeforeEach
    void setup() {
        handler = new TrackingWebSocketHandler();
        session = mock(WebSocketSession.class);
    }

    @Test
    void afterConnectionEstablished_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=123");
        when(session.getUri()).thenReturn(uri);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        verify(session).sendMessage(any());
    }

    @Test
    void afterConnectionEstablished_nullUri() throws Exception {
        when(session.getUri()).thenReturn(null);

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.BAD_DATA);
    }

    @Test
    void afterConnectionEstablished_noOrderId() throws Exception {
        URI uri = new URI("ws://localhost:8080/track");
        when(session.getUri()).thenReturn(uri);

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.BAD_DATA);
    }

    @Test
    void afterConnectionEstablished_emptyOrderId() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=");
        when(session.getUri()).thenReturn(uri);

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.BAD_DATA);
    }

    @Test
    void afterConnectionClosed_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=123");
        when(session.getUri()).thenReturn(uri);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);
        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        // Should not throw exception
        assertDoesNotThrow(() -> handler.afterConnectionClosed(session, CloseStatus.NORMAL));
    }

    @Test
    void afterConnectionClosed_nullUri() throws Exception {
        when(session.getUri()).thenReturn(null);

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        // Should handle gracefully
        assertDoesNotThrow(() -> handler.afterConnectionClosed(session, CloseStatus.NORMAL));
    }

    @Test
    void broadcastLocation_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        Map<String, Object> payload = new HashMap<>();
        payload.put("latitude", 22.7);
        payload.put("longitude", 75.8);

        handler.broadcastLocation("123", payload);

        verify(session, atLeastOnce()).sendMessage(any());
    }

    @Test
    void broadcastLocation_noSessions() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("latitude", 22.7);

        // Should not throw exception
        assertDoesNotThrow(() -> handler.broadcastLocation("999", payload));
    }

    @Test
    void broadcastStatus_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "DELIVERED");

        handler.broadcastStatus("123", payload);

        verify(session, atLeastOnce()).sendMessage(any());
    }

    @Test
    void broadcastStatus_closedSession() throws Exception {
        URI uri = new URI("ws://localhost:8080/track?orderId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true).thenReturn(false);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "DELIVERED");

        handler.broadcastStatus("123", payload);

        // Should handle closed session gracefully
        assertDoesNotThrow(() -> handler.broadcastStatus("123", payload));
    }

    @Test
    void multipleSessionsSameOrder() throws Exception {
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        URI uri = new URI("ws://localhost:8080/track?orderId=123");

        when(session1.getUri()).thenReturn(uri);
        when(session2.getUri()).thenReturn(uri);
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);
        doNothing().when(session1).sendMessage(any());
        doNothing().when(session2).sendMessage(any());

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        Map<String, Object> payload = new HashMap<>();
        payload.put("latitude", 22.7);

        handler.broadcastLocation("123", payload);

        verify(session1, atLeastOnce()).sendMessage(any());
        verify(session2, atLeastOnce()).sendMessage(any());
    }
}
