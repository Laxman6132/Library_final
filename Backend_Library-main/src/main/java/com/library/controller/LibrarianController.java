package com.library.controller;

import com.library.entity.Book;
import com.library.entity.User;
import com.library.service.LibrarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/librarian")
public class LibrarianController {

    @Autowired
    private LibrarianService librarianService;

    // ================= BOOK MANAGEMENT =================

    @PostMapping("/book")
    public ResponseEntity<String> addBook(@RequestBody Book book) {
        librarianService.addBook(book);
        return ResponseEntity.ok("Book added successfully");
    }

    @PutMapping("/book/{bookId}")
    public ResponseEntity<String> updateBook(
            @PathVariable int bookId,
            @RequestBody Book book
    ) {
        librarianService.updateBook(bookId, book);
        return ResponseEntity.ok("Book updated successfully");
    }

    // ================= ISSUE / RETURN =================

    @PostMapping("/issue")
    public ResponseEntity<String> issueBook(
            @RequestParam int userId,
            @RequestParam int bookId
    ) {
        boolean issued = librarianService.issueBook(userId, bookId);

        if (issued) {
            return ResponseEntity.ok("Book issued successfully");
        }
        return ResponseEntity.badRequest().body("Cannot issue book (fine exists / no stock / already issued)");
    }

    @PutMapping("/return/{issuedBookId}")
    public ResponseEntity<String> returnBook(@PathVariable int issuedBookId) {
        librarianService.returnBook(issuedBookId);
        return ResponseEntity.ok("Book returned successfully");
    }

    // ================= USER MANAGEMENT (VIEW ONLY) =================

    @GetMapping("/user/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable int userId) {
        return ResponseEntity.of(
                java.util.Optional.ofNullable(librarianService.getUserById(userId))
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(librarianService.getAllUser());
    }
}