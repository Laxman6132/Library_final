package com.library.repository;

import com.library.entity.IssuedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface AnalyticsRepository extends JpaRepository<IssuedBook, Integer> {

    /**
     * Most Borrowed Books — top 10 by total issue count.
     */
    @Query(value = "SELECT b.book_id AS bookId, b.title AS title, COUNT(ib.issue_id) AS totalIssues " +
                   "FROM issued_book ib JOIN book b ON ib.book_id = b.book_id " +
                   "GROUP BY b.book_id, b.title ORDER BY totalIssues DESC LIMIT 10",
           nativeQuery = true)
    List<Map<String, Object>> findMostBorrowedBooks();

    /**
     * Issue Trends Over Time — monthly issue counts.
     */
    @Query(value = "SELECT DATE_FORMAT(ib.issue_date, '%Y-%m') AS month, COUNT(*) AS totalIssues " +
                   "FROM issued_book ib GROUP BY month ORDER BY month",
           nativeQuery = true)
    List<Map<String, Object>> findIssueTrends();

    /**
     * Fine Defaulters & Late Returners — users who returned late or paid fines.
     */
    @Query(value = "SELECT u.user_id AS userId, u.user_name AS userName, u.email_id AS email, " +
                   "COUNT(ib.issue_id) AS lateReturns, COALESCE(SUM(ib.fine_paid), 0) AS totalFines " +
                   "FROM issued_book ib JOIN user u ON ib.user_id = u.user_id " +
                   "WHERE ib.return_date > ib.due_date OR ib.fine_paid > 0 " +
                   "GROUP BY u.user_id, u.user_name, u.email_id " +
                   "ORDER BY totalFines DESC",
           nativeQuery = true)
    List<Map<String, Object>> findFineDefaulters();

    /**
     * Inactive Users — users with no issued books in the last 6 months.
     * Only considers users with role 'USER'.
     */
    @Query(value = "SELECT u.user_id AS userId, u.user_name AS userName, u.email_id AS email " +
                   "FROM user u WHERE u.user_id NOT IN " +
                   "(SELECT DISTINCT ib.user_id FROM issued_book ib " +
                   " WHERE ib.issue_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)) " +
                   "AND u.role = 'USER'",
           nativeQuery = true)
    List<Map<String, Object>> findInactiveUsers();
}
