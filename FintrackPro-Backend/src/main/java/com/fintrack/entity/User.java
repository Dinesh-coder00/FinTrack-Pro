package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registered user of FinTrack Pro.
 */
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt-hashed password – never exposed in any DTO. */
    @Column(nullable = false)
    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "dark_mode", nullable = false)
    @Builder.Default
    private Boolean darkMode = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
