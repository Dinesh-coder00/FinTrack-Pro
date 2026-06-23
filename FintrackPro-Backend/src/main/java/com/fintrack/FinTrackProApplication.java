package com.fintrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * FinTrack Pro – Personal Finance Management System
 *
 * Spring Boot entry point.
 * All configuration is in application.properties and the @Configuration classes.
 */
@SpringBootApplication
public class FinTrackProApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinTrackProApplication.class, args);
    }
}
