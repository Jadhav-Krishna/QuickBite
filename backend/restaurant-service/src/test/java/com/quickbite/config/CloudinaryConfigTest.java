package com.quickbite.config;

import com.cloudinary.Cloudinary;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class CloudinaryConfigTest {

    @Test
    void cloudinaryBean_created() {
        CloudinaryConfig config = new CloudinaryConfig();
        ReflectionTestUtils.setField(config, "cloudName", "test-cloud");
        ReflectionTestUtils.setField(config, "apiKey", "test-key");
        ReflectionTestUtils.setField(config, "apiSecret", "test-secret");

        Cloudinary cloudinary = config.cloudinary();

        assertNotNull(cloudinary);
        assertEquals("test-cloud", cloudinary.config.cloudName);
        assertEquals("test-key", cloudinary.config.apiKey);
        assertEquals("test-secret", cloudinary.config.apiSecret);
    }
}
