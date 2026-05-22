package com.quickbite.config;

import com.razorpay.RazorpayClient;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "razorpay.key")
@Getter
@Setter
public class RazorpayConfig {

    private String id;
    private String secret;

    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        return new RazorpayClient(id, secret);
    }
}
