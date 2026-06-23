package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** Paginated full transaction history, newest first. */
    Page<Transaction> findByUserIdOrderByDateDescCreatedAtDesc(Long userId, Pageable pageable);

    /** Latest 5 transactions for the dashboard widget. */
    List<Transaction> findTop5ByUserIdOrderByDateDesc(Long userId);

    /** Transactions within a date range for reports. */
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, LocalDate from, LocalDate to);
}
