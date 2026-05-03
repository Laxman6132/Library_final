package com.library.controller;

import com.library.repository.AnalyticsRepository;
import com.library.service.impl.BulkEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private BulkEmailService bulkEmailService;

    /** Guard flag to prevent repeated concurrent triggering of bulk emails. */
    private final AtomicBoolean emailJobRunning = new AtomicBoolean(false);

    /**
     * Top 10 most borrowed books.
     */
    @GetMapping("/most-borrowed")
    public ResponseEntity<List<Map<String, Object>>> getMostBorrowed() {
        return ResponseEntity.ok(analyticsRepository.findMostBorrowedBooks());
    }

    /**
     * Monthly issue trend data.
     */
    @GetMapping("/issue-trends")
    public ResponseEntity<List<Map<String, Object>>> getIssueTrends() {
        return ResponseEntity.ok(analyticsRepository.findIssueTrends());
    }

    /**
     * Users with late returns or fines paid.
     */
    @GetMapping("/fine-defaulters")
    public ResponseEntity<List<Map<String, Object>>> getFineDefaulters() {
        return ResponseEntity.ok(analyticsRepository.findFineDefaulters());
    }

    /**
     * Users with no borrowing activity in the last 6 months.
     */
    @GetMapping("/inactive-users")
    public ResponseEntity<List<Map<String, Object>>> getInactiveUsers() {
        return ResponseEntity.ok(analyticsRepository.findInactiveUsers());
    }

    /**
     * Trigger bulk "We Miss You" retention emails to inactive users.
     * Secured to ADMIN and LIBRARIAN roles only.
     * Returns 202 Accepted immediately — actual sending is asynchronous.
     */
    @PostMapping("/email-inactive")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Map<String, String>> emailInactiveUsers() {

        if (!emailJobRunning.compareAndSet(false, true)) {
            log.warn("Bulk email job already in progress — rejecting duplicate request");
            return ResponseEntity.status(409)
                    .body(Map.of("message", "An email campaign is already in progress. Please wait."));
        }

        log.info("Bulk inactive-user email triggered by admin/librarian");
        bulkEmailService.sendInactiveUserEmails(() -> emailJobRunning.set(false));

        return ResponseEntity.accepted()
                .body(Map.of("message", "Retention emails are being sent in the background."));
    }
}
