package com.quickbite.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // Check if Cloudinary is configured
        if (cloudName == null || cloudName.equals("your_cloud_name") || 
            apiKey == null || apiKey.equals("your_api_key") ||
            apiSecret == null || apiSecret.equals("your_api_secret")) {
            // Return a dummy Cloudinary instance that won't crash
            return new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", "dummy",
                    "api_key", "dummy",
                    "api_secret", "dummy",
                    "secure", true
            ));
        }
        
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
