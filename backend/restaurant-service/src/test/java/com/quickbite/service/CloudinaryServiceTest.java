package com.quickbite.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
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
    @Mock private Uploader uploader;
    @Mock private MultipartFile file;

    @InjectMocks private CloudinaryService service;

    @Test
    void uploadImage_success() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn(new byte[]{1});
        when(uploader.upload(any(), any()))
                .thenReturn(Map.of("secure_url", "https://test.url"));

        String url = service.uploadImage(file, "folder");

        assertEquals("https://test.url", url);
    }

    @Test
    void uploadImage_emptyFile() {
        when(file.isEmpty()).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.uploadImage(file, "folder"));
    }

    @Test
    void uploadImage_invalidType() {
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("text/plain");

        assertThrows(IllegalArgumentException.class,
                () -> service.uploadImage(file, "folder"));
    }

    @Test
    void uploadImage_uploadFails() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");
        when(file.getBytes()).thenReturn(new byte[]{1});
        when(uploader.upload(any(), any())).thenThrow(new IOException("Upload failed"));

        assertThrows(IOException.class,
                () -> service.uploadImage(file, "folder"));
    }

    @Test
    void deleteImage_success() throws Exception {
        when(cloudinary.uploader()).thenReturn(uploader);
        String imageUrl = "https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg";
        when(uploader.destroy(anyString(), any())).thenReturn(Map.of());

        service.deleteImage(imageUrl);

        verify(uploader).destroy(anyString(), any());
    }

    @Test
    void deleteImage_nullUrl() throws Exception {
        service.deleteImage(null);

        verify(cloudinary, never()).uploader();
    }
}