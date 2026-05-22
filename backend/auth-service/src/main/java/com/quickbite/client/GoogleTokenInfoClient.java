package com.quickbite.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "google-token-info-client", url = "https://www.googleapis.com")
public interface GoogleTokenInfoClient {

    @GetMapping("/oauth2/v3/tokeninfo")
    String getTokenInfo(@RequestParam("access_token") String accessToken);
}
