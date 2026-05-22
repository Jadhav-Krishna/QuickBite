package com.quickbite.client;

import java.util.List;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "location-iq-client", url = "https://us1.locationiq.com")
public interface LocationIqClient {

    @GetMapping("/v1/search")
    List<Map<String, Object>> search(
            @RequestParam("key") String apiKey,
            @RequestParam("q") String address,
            @RequestParam("format") String format
    );

    @GetMapping("/v1/reverse")
    Map<String, Object> reverse(
            @RequestParam("key") String apiKey,
            @RequestParam("lat") double latitude,
            @RequestParam("lon") double longitude,
            @RequestParam("format") String format
    );
}
