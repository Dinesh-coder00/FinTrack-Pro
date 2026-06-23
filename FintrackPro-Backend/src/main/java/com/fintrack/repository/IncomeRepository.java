package com.fintrack.repository;

import com.fintrack.entity.Income;
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
 * Spring Data JPA repository for {@link Income} entities.
 */
@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    Page<Income> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);

    List<Income> findByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, LocalDate from, LocalDate to);

    /** Total income across all time for a user. */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :uid")
    BigDecimal sumByUserId(@Param("uid") Long userId);

    /** Total income for a specific year/month. */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i " +
           "WHERE i.user.id = :uid " +
           "AND YEAR(i.date) = :yr " +
           "AND MONTH(i.date) = :mo")
    BigDecimal sumByUserIdAndMonth(
            @Param("uid") Long userId,
            @Param("yr")  int year,
            @Param("mo")  int month);

    /**
     * Monthly income totals for trend chart (last N months).
     * Returns Object[] rows: [0] = "YYYY-MM" (String), [1] = SUM (BigDecimal).
     */
    @Query(value = "SELECT DATE_FORMAT(i.date, '%Y-%m') AS month, " +
                   "       SUM(i.amount)               AS income " +
                   "FROM   income i " +
                   "WHERE  i.user_id = :uid " +
                   "AND    i.date   >= :from " +
                   "GROUP  BY DATE_FORMAT(i.date, '%Y-%m') " +
                   "ORDER  BY month ASC",
           nativeQuery = true)
    List<Object[]> monthlyIncomeTrend(
            @Param("uid")  Long      userId,
            @Param("from") LocalDate from);
}
