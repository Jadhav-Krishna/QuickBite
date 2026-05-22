package com.quickbite.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "github-oauth-client", url = "https://github.com")
public interface GitHubOAuthClient {

    @PostMapping(value = "/login/oauth/access_token", consumes = MediaType.APPLICATION_JSON_VALUE)
    String exchangeCode(@RequestHeader("Accept") String accept, @RequestBody Map<String, String> params);
}
