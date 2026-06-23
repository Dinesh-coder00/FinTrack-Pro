package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A named savings target that the user works toward over time.
 */
@Entity
@Table(name = "savings_goal",
       indexes = @Index(name = "idx_goal_user_status", columnList = "user_id, status"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SavingsGoal {

    public enum Status { Active, Completed, Paused }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "saved_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal savedAmount = BigDecimal.ZERO;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private Status status = Status.Active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void preUpdate()  { updatedAt = LocalDateTime.now(); }
}
