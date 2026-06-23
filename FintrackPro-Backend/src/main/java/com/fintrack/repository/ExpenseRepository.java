package com.fintrack.repository;

import com.fintrack.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Expense} entities.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /* ── Basic paged listing ──────────────────────────────────────────────── */

    Page<Expense> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);

    Page<Expense> findByUserIdAndCategoryOrderByDateDesc(
            Long userId, Expense.Category category, Pageable pageable);

    Page<Expense> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, LocalDate from, LocalDate to, Pageable pageable);

    Page<Expense> findByUserIdAndCategoryAndDateBetweenOrderByDateDesc(
            Long userId, Expense.Category category,
            LocalDate from, LocalDate to, Pageable pageable);

    /* ── Keyword search ───────────────────────────────────────────────────── */

    @Query("SELECT e FROM Expense e " +
           "WHERE e.user.id = :uid " +
           "AND LOWER(e.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY e.date DESC")
    Page<Expense> searchByTitle(
            @Param("uid") Long userId,
            @Param("q")   String query,
            Pageable pageable);

    /* ── Aggregates ───────────────────────────────────────────────────────── */

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :uid")
    BigDecimal sumByUserId(@Param("uid") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :uid " +
           "AND YEAR(e.date) = :yr " +
           "AND MONTH(e.date) = :mo")
    BigDecimal sumByUserIdAndMonth(
            @Param("uid") Long userId,
            @Param("yr")  int year,
            @Param("mo")  int month);

    /**
     * Expense totals grouped by category.
     * Returns Object[] rows: [0] = category (String), [1] = SUM (BigDecimal).
     */
    @Query("SELECT e.category AS category, SUM(e.amount) AS total " +
           "FROM Expense e " +
           "WHERE e.user.id = :uid " +
           "GROUP BY e.category")
    List<Object[]> sumByCategory(@Param("uid") Long userId);

    /**
     * Monthly expense totals for the trend chart (last N months).
     * Returns Object[] rows: [0] = "YYYY-MM" (String), [1] = SUM (BigDecimal).
     */
    @Query(value = "SELECT DATE_FORMAT(e.date, '%Y-%m') AS month, " +
                   "       SUM(e.amount)               AS expense " +
                   "FROM   expenses e " +
                   "WHERE  e.user_id = :uid " +
                   "AND    e.date   >= :from " +
                   "GROUP  BY DATE_FORMAT(e.date, '%Y-%m') " +
                   "ORDER  BY month ASC",
           nativeQuery = true)
    List<Object[]> monthlyExpenseTrend(
            @Param("uid")  Long      userId,
            @Param("from") LocalDate from);
}
