package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AgentStatusTest {

    @Test
    void agentStatus_values() {
        AgentStatus[] statuses = AgentStatus.values();

        assertEquals(4, statuses.length);
        assertTrue(java.util.Arrays.asList(statuses).contains(AgentStatus.AVAILABLE));
        assertTrue(java.util.Arrays.asList(statuses).contains(AgentStatus.BUSY));
        assertTrue(java.util.Arrays.asList(statuses).contains(AgentStatus.OFFLINE));
        assertTrue(java.util.Arrays.asList(statuses).contains(AgentStatus.ON_BREAK));
    }

    @Test
    void agentStatus_valueOf() {
        AgentStatus status = AgentStatus.valueOf("AVAILABLE");

        assertEquals(AgentStatus.AVAILABLE, status);
    }
}
