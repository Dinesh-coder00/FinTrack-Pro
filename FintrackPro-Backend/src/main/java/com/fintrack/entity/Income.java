package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A single income record owned by a user.
 */
@Entity
@Table(name = "income",
       indexes = {
           @Index(name = "idx_income_user_date",     columnList = "user_id, date"),
           @Index(name = "idx_income_user_category", columnList = "user_id, category")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
