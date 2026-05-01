package com.library.controller;

import com.library.repository.AnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsRepository analyticsRepository;

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
}
