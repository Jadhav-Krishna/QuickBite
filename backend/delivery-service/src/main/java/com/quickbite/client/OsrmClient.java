package com.quickbite.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "osrm-client", url = "http://router.project-osrm.org")
public interface OsrmClient {

    @GetMapping("/route/v1/driving/{coordinates}")
    Map<String, Object> getRoute(
            @PathVariable("coordinates") String coordinates,
            @RequestParam("overview") String overview,
            @RequestParam("geometries") String geometries
    );
}
