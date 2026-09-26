package com.campusnexus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final String[] allowedMethods;
    private final String allowedHeaders;
    private final boolean allowCredentials;
    private final long maxAge;

    public CorsConfig(
            @Value("${cors.allowed-origins:http://localhost:3000}") String allowedOrigins,
            @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,PATCH,OPTIONS}") String allowedMethods,
            @Value("${cors.allowed-headers:*}") String allowedHeaders,
            @Value("${cors.allow-credentials:true}") boolean allowCredentials,
            @Value("${cors.max-age:3600}") long maxAge
    ) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
        this.allowedMethods = Arrays.stream(allowedMethods.split(","))
                .map(String::trim)
                .filter(method -> !method.isEmpty())
                .toArray(String[]::new);
        this.allowedHeaders = allowedHeaders;
        this.allowCredentials = allowCredentials;
        this.maxAge = maxAge;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (allowedOrigins.length > 0) {
            registry.addMapping("/**")
                    .allowedOrigins(allowedOrigins)
                    .allowedMethods(allowedMethods)
                    .allowedHeaders(allowedHeaders)
                    .allowCredentials(allowCredentials)
                    .maxAge(maxAge);
        }
    }
}
