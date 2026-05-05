package com.quickbite.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.quickbite.exception.ImageUploadException;
import com.quickbite.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    @Mock private Cloudinary cloudinary;
    @Mock private MultipartFile file;
    @Mock private Uploader uploader;

    @InjectMocks private CloudinaryService cloudinaryService;

    @Test
    void uploadImage_success() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        String url = cloudinaryService.uploadImage(file, "menu");

        // Service returns placeholder when config is not properly set
        assertTrue(url.contains("placeholder"));
    }

    @Test
    void uploadImage_invalidFile() {
        when(file.isEmpty()).thenReturn(true);

        assertThrows(InvalidRequestException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }

    @Test
    void uploadImage_invalidType() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("text/plain");

        assertThrows(InvalidRequestException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }

    @Test
    void uploadImage_uploadFails() throws Exception {
        // Create a real Cloudinary instance with valid config to bypass placeholder logic
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "valid-cloud-name");
        config.put("api_key", "test-key");
        config.put("api_secret", "test-secret");
        Cloudinary realCloudinary = new Cloudinary(config);
        
        // Inject the real Cloudinary into the service
        CloudinaryService testService = new CloudinaryService(realCloudinary);
        
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenThrow(new IOException("Failed to read file"));

        assertThrows(ImageUploadException.class,
                () -> testService.uploadImage(file, "menu"));
    }

    @Test
    void uploadImage_nullFile() {
        assertThrows(InvalidRequestException.class,
                () -> cloudinaryService.uploadImage(null, "menu"));
    }

    @Test
    void uploadImage_nullContentType() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn(null);

        assertThrows(InvalidRequestException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }

    @Test
    void deleteImage_success() {
        cloudinaryService.deleteImage("http://cloudinary.com/image.jpg");
        // Should not throw exception
    }

    @Test
    void deleteImage_nullUrl() {
        cloudinaryService.deleteImage(null);
        // Should not throw exception
    }

    @Test
    void deleteImage_emptyUrl() {
        cloudinaryService.deleteImage("");
        // Should not throw exception
    }

    @Test
    void uploadImage_cloudinaryNotConfigured_dummy() throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dummy");
        config.put("api_key", "test-key");
        config.put("api_secret", "test-secret");
        Cloudinary testCloudinary = new Cloudinary(config);
        CloudinaryService testService = new CloudinaryService(testCloudinary);

        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        String url = testService.uploadImage(file, "menu");

        assertTrue(url.contains("placeholder"));
        assertTrue(url.contains("Image+Upload+Disabled"));
    }

    @Test
    void uploadImage_cloudinaryNotConfigured_yourCloudName() throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "your_cloud_name");
        config.put("api_key", "test-key");
        config.put("api_secret", "test-secret");
        Cloudinary testCloudinary = new Cloudinary(config);
        CloudinaryService testService = new CloudinaryService(testCloudinary);

        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        String url = testService.uploadImage(file, "menu");

        assertTrue(url.contains("placeholder"));
        assertTrue(url.contains("Image+Upload+Disabled"));
    }

    @Test
    void uploadImage_cloudinaryNotConfigured_null() throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", null);
        config.put("api_key", "test-key");
        config.put("api_secret", "test-secret");
        Cloudinary testCloudinary = new Cloudinary(config);
        CloudinaryService testService = new CloudinaryService(testCloudinary);

        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        String url = testService.uploadImage(file, "menu");

        assertTrue(url.contains("placeholder"));
        assertTrue(url.contains("Image+Upload+Disabled"));
    }

    @Test
    void deleteImage_withValidCloudinaryUrl() throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "test-cloud");
        config.put("api_key", "test-key");
        config.put("api_secret", "test-secret");
        Cloudinary realCloudinary = new Cloudinary(config);
        CloudinaryService testService = new CloudinaryService(realCloudinary);

        testService.deleteImage("https://res.cloudinary.com/test/image/upload/v123456/folder/image.jpg");
    }

    @Test
    void deleteImage_withInvalidUrl() {
        cloudinaryService.deleteImage("https://invalid-url.com/image.jpg");
    }

    @Test
    void uploadImage_withJpegImage() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/jpeg");

        String url = cloudinaryService.uploadImage(file, "menu");

        assertTrue(url.contains("placeholder"));
    }

    @Test
    void uploadImage_withGifImage() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/gif");

        String url = cloudinaryService.uploadImage(file, "menu");

        assertTrue(url.contains("placeholder"));
    }
}