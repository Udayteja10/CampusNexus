package com.campusnexus.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * EnvironmentPostProcessor that automatically loads environment variables from .env
 * in the project or backend root directory if present.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    public static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> envMap = findAndReadDotenv();
        if (!envMap.isEmpty()) {
            // Apply as system properties for any early non-Spring resolution
            envMap.forEach((key, value) -> {
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value.toString());
                }
            });

            // Insert property source right after system environment variables
            if (environment.getPropertySources().contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                environment.getPropertySources().addAfter(
                        StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                        new MapPropertySource(PROPERTY_SOURCE_NAME, envMap)
                );
            } else {
                environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, envMap));
            }
        }
    }

    /**
     * Helper method to populate System properties early prior to SpringApplication.run
     */
    public static void loadToSystemProperties() {
        Map<String, Object> envMap = findAndReadDotenv();
        envMap.forEach((key, value) -> {
            if (System.getProperty(key) == null && System.getenv(key) == null) {
                System.setProperty(key, value.toString());
            }
        });
    }

    private static Map<String, Object> findAndReadDotenv() {
        File[] possibleLocations = new File[]{
                new File(".env"),
                new File("backend/.env"),
                new File("../backend/.env")
        };

        for (File file : possibleLocations) {
            if (file.exists() && file.isFile()) {
                return loadEnvFile(file);
            }
        }
        return Map.of();
    }

    private static Map<String, Object> loadEnvFile(File file) {
        Map<String, Object> map = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                String key = line.substring(0, eqIdx).trim();
                String value = line.substring(eqIdx + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                    if (value.length() >= 2) {
                        value = value.substring(1, value.length() - 1);
                    }
                }
                if (!key.isEmpty()) {
                    map.put(key, value);
                }
            }
        } catch (Exception ignored) {
        }
        return map;
    }
}
