package com.library.repository;

import com.library.entity.IssuedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssuedBookRepository extends JpaRepository<IssuedBook,Integer> {
    List<IssuedBook> findByUserUserId(int userId);

    /**
     * Find issued books that are due tomorrow and haven't had a reminder sent yet.
     * Uses a safe range (not equality) to handle time components in due_date.
     */
    @Query(value = "SELECT * FROM issued_book ib " +
            "WHERE ib.returned = 0 " +
            "AND ib.reminder_sent = 0 " +
            "AND ib.due_date >= CURDATE() + INTERVAL 1 DAY " +
            "AND ib.due_date < CURDATE() + INTERVAL 2 DAY",
            nativeQuery = true)
    List<IssuedBook> findBooksDueTomorrow();

    /**
     * Mark a specific issued book's reminder as sent (idempotency).
     */
    @Modifying
    @Query("UPDATE IssuedBook ib SET ib.reminderSent = true WHERE ib.issueId = :issueId")
    void markReminderSent(@Param("issueId") int issueId);
}
