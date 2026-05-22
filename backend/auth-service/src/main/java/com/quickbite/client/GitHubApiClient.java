package com.quickbite.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "github-api-client", url = "https://api.github.com")
public interface GitHubApiClient {

    @GetMapping("/user")
    String getUser(@RequestHeader("Authorization") String authorization);

    @GetMapping("/user/emails")
    String getUserEmails(@RequestHeader("Authorization") String authorization);
}
