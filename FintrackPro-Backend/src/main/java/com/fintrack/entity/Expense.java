package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A single expense record owned by a user.
 */
@Entity
@Table(name = "expenses",
       indexes = {
           @Index(name = "idx_expense_user_date",     columnList = "user_id, date"),
           @Index(name = "idx_expense_user_category", columnList = "user_id, category")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    /** Allowed expense categories — kept in sync with the DB ENUM. */
    public enum Category {
        Food, Travel, Shopping, Bills, Entertainment, Health, Education, Other
    }

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;

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
