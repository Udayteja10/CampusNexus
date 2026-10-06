package com.campusnexus;

import com.campusnexus.config.DotenvEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampusNexusApplication {

    public static void main(String[] args) {
        DotenvEnvironmentPostProcessor.loadToSystemProperties();
        SpringApplication.run(CampusNexusApplication.class, args);
    }
}

