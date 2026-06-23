package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Monthly spending budget set by the user.
 */
@Entity
@Table(name = "budget",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_budget_user_month",
           columnNames = {"user_id", "month", "year"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 1–12 */
    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalLimit;

    /**
     * Percentage of budget consumed that fires a warning notification.
     * Default: 80 %
     */
    @Column(name = "warn_pct", nullable = false)
    @Builder.Default
    private Integer warnPct = 80;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
