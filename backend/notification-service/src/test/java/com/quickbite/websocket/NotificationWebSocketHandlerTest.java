package com.quickbite.websocket;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationWebSocketHandlerTest {

    private NotificationWebSocketHandler handler;
    private WebSocketSession session;

    @BeforeEach
    void setup() {
        handler = new NotificationWebSocketHandler();
        session = mock(WebSocketSession.class);
    }

    @Test
    void afterConnectionEstablished_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");
        when(session.getUri()).thenReturn(uri);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        verify(session).sendMessage(any());
        assertEquals(1, handler.getConnectedUserCount());
        assertEquals(1, handler.getActiveConnectionCount());
    }

    @Test
    void afterConnectionEstablished_nullSession() throws Exception {
        handler.afterConnectionEstablished(null);

        assertEquals(0, handler.getConnectedUserCount());
    }

    @Test
    void afterConnectionEstablished_nullUri() throws Exception {
        when(session.getUri()).thenReturn(null);

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.BAD_DATA);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "ws://localhost:8080/ws/notifications",
        "ws://localhost:8080/ws/notifications?userId=",
        "ws://localhost:8080/ws/notifications?userId=invalid"
    })
    void afterConnectionEstablished_invalidUserIdScenarios(String uriString) throws Exception {
        URI uri = new URI(uriString);
        when(session.getUri()).thenReturn(uri);

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.BAD_DATA);
    }

    @Test
    void afterConnectionClosed_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");
        when(session.getUri()).thenReturn(uri);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);
        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        assertEquals(0, handler.getConnectedUserCount());
    }

    @Test
    void afterConnectionClosed_nullSession() throws Exception {
        handler.afterConnectionClosed(null, CloseStatus.NORMAL);

        // Should not throw exception
        assertDoesNotThrow(() -> handler.afterConnectionClosed(null, CloseStatus.NORMAL));
    }

    @Test
    void afterConnectionClosed_nullUri() throws Exception {
        when(session.getUri()).thenReturn(null);

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        // Should handle gracefully
        assertDoesNotThrow(() -> handler.afterConnectionClosed(session, CloseStatus.NORMAL));
    }

    @Test
    void sendNotificationToUser_success() throws Exception {
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");
        notification.put("message", "Test message");

        handler.sendNotificationToUser(123L, notification);

        verify(session, atLeastOnce()).sendMessage(any());
    }

    @Test
    void sendNotificationToUser_noActiveSessions() {
        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");

        // Should not throw exception
        assertDoesNotThrow(() -> handler.sendNotificationToUser(999L, notification));
    }

    @Test
    void sendNotificationToUser_closedSession() throws Exception {
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true).thenReturn(false);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);

        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");

        handler.sendNotificationToUser(123L, notification);

        // Should handle closed session gracefully
        assertDoesNotThrow(() -> handler.sendNotificationToUser(123L, notification));
    }

    @Test
    void sendNotificationToUsers_success() throws Exception {
        URI uri1 = new URI("ws://localhost:8080/ws/notifications?userId=123");
        URI uri2 = new URI("ws://localhost:8080/ws/notifications?userId=456");
        
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);

        when(session1.getUri()).thenReturn(uri1);
        when(session2.getUri()).thenReturn(uri2);
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);
        doNothing().when(session1).sendMessage(any());
        doNothing().when(session2).sendMessage(any());

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");

        handler.sendNotificationToUsers(Arrays.asList(123L, 456L), notification);

        verify(session1, atLeastOnce()).sendMessage(any());
        verify(session2, atLeastOnce()).sendMessage(any());
    }

    @Test
    void multipleSessionsSameUser() throws Exception {
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");

        when(session1.getUri()).thenReturn(uri);
        when(session2.getUri()).thenReturn(uri);
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);
        doNothing().when(session1).sendMessage(any());
        doNothing().when(session2).sendMessage(any());

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        assertEquals(1, handler.getConnectedUserCount());
        assertEquals(2, handler.getActiveConnectionCount());

        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");

        handler.sendNotificationToUser(123L, notification);

        verify(session1, atLeastOnce()).sendMessage(any());
        verify(session2, atLeastOnce()).sendMessage(any());
    }

    @Test
    void sendNotificationToUser_sendMessageError() throws Exception {
        URI uri = new URI("ws://localhost:8080/ws/notifications?userId=123");
        when(session.getUri()).thenReturn(uri);
        when(session.isOpen()).thenReturn(true);
        doNothing().when(session).sendMessage(any());

        handler.afterConnectionEstablished(session);
        
        // Now throw exception on subsequent sends
        doThrow(new java.io.IOException("Send failed")).when(session).sendMessage(any());

        Map<String, Object> notification = new HashMap<>();
        notification.put("title", "Test");

        // Should handle send error gracefully
        assertDoesNotThrow(() -> handler.sendNotificationToUser(123L, notification));
    }

    @Test
    void getActiveConnectionCount_multipleUsers() throws Exception {
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        WebSocketSession session3 = mock(WebSocketSession.class);

        URI uri1 = new URI("ws://localhost:8080/ws/notifications?userId=123");
        URI uri2 = new URI("ws://localhost:8080/ws/notifications?userId=123");
        URI uri3 = new URI("ws://localhost:8080/ws/notifications?userId=456");

        when(session1.getUri()).thenReturn(uri1);
        when(session2.getUri()).thenReturn(uri2);
        when(session3.getUri()).thenReturn(uri3);
        doNothing().when(session1).sendMessage(any());
        doNothing().when(session2).sendMessage(any());
        doNothing().when(session3).sendMessage(any());

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);
        handler.afterConnectionEstablished(session3);

        assertEquals(2, handler.getConnectedUserCount());
        assertEquals(3, handler.getActiveConnectionCount());
    }
}
