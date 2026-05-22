package com.quickbite.util;

import com.quickbite.config.RabbitMQConfig;
import com.quickbite.event.NotificationEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationPublisherTest {

    @Mock private RabbitTemplate rabbitTemplate;

    @InjectMocks private NotificationPublisher publisher;

    @Test
    void publishNotification_success() {
        NotificationEvent event = NotificationEvent.builder()
                .userId(1L)
                .title("Test")
                .message("Message")
                .build();

        publisher.publishNotification(event);

        verify(rabbitTemplate).convertAndSend(
            RabbitMQConfig.NOTIFICATION_EXCHANGE,
            RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
            event
        );
    }

    @Test
    void publishNotification_failure() {
        NotificationEvent event = NotificationEvent.builder()
                .userId(1L)
                .title("Test")
                .build();

        doThrow(new RuntimeException("RabbitMQ error"))
            .when(rabbitTemplate).convertAndSend(
                anyString(), anyString(), any(NotificationEvent.class)
            );

        publisher.publishNotification(event);

        verify(rabbitTemplate).convertAndSend(
            anyString(), anyString(), any(NotificationEvent.class)
        );
    }
}
