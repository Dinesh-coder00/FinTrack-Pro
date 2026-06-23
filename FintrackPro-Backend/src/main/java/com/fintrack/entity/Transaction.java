package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Unified ledger entry that mirrors every income / expense write.
 * Used by the dashboard and reports to avoid joining two tables.
 */
@Entity
@Table(name = "transactions",
       indexes = {
           @Index(name = "idx_txn_user_date", columnList = "user_id, date"),
           @Index(name = "idx_txn_user_type", columnList = "user_id, type")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    public enum Type { Income, Expense }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Type type;

    /** FK to income.id or expenses.id depending on {@link #type}. */
    @Column(name = "ref_id", nullable = false)
    private Long refId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
