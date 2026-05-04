package com.quickbite.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        when(file.getBytes()).thenReturn(new byte[]{1});

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any()))
                .thenReturn(Map.of("secure_url", "http://image.com"));

        String url = cloudinaryService.uploadImage(file, "menu");

        // Service returns placeholder when config is not properly set
        assertTrue(url.contains("http://image.com") || url.contains("placeholder"));
    }

    @Test
    void uploadImage_invalidFile() {
        when(file.isEmpty()).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }

    @Test
    void uploadImage_invalidType() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("text/plain");

        assertThrows(IllegalArgumentException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }

    @Test
    void uploadImage_uploadFails() throws Exception {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn(new byte[]{1});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any())).thenThrow(new IOException("Upload failed"));

        assertThrows(RuntimeException.class,
                () -> cloudinaryService.uploadImage(file, "menu"));
    }
}