package com.quickbite.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "google-oauth-client", url = "https://oauth2.googleapis.com")
public interface GoogleOAuthClient {

    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    String exchangeCode(@RequestBody MultiValueMap<String, String> params);
}
