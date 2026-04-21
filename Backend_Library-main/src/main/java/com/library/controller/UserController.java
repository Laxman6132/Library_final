package com.library.controller;

import com.library.dto.*;
import com.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/bcrptAll")
    public void Bcrpt(){
        userService.bcrpt();
    }
    // ================= BOOK APIs =================

    @GetMapping("/books")
    public ResponseEntity<List<BookDTO>> getAllBooks() {
        return ResponseEntity.ok(userService.getAllBook());
    }

    @GetMapping("/books/genre/{genre}")
    public ResponseEntity<List<BookDTO>> getBooksByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(userService.getBooksByGenre(genre));
    }

    @GetMapping("/books/search")
    public ResponseEntity<List<BookDTO>> searchBooks(@RequestParam String prefix) {
        return ResponseEntity.ok(userService.getBooksByPrefix(prefix));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable int id) {
        return ResponseEntity.ok(userService.getBookById(id));
    }

    // ================= WAITING LIST =================

    @PostMapping("/waiting-list")
    public ResponseEntity<String> addToWaitingList(
            @RequestParam int userId,
            @RequestParam int bookId
    ) {
        boolean result = userService.addWL(userId, bookId);

        return ResponseEntity.ok(
                result ? "Added to waiting list" : "Already in waiting list"
        );
    }

    @DeleteMapping("/waiting-list/{id}")
    public ResponseEntity<Void> deleteWaitingList(@PathVariable int id) {
        userService.deleteWL(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/waiting-list/{userId}")
    public ResponseEntity<List<WaitingListDTO>> getWaitingList(@PathVariable int userId) {
        return ResponseEntity.ok(userService.getWaitingListById(userId));
    }

    // ================= FAVOURITES =================

    @PostMapping("/favourite")
    public ResponseEntity<String> addFavourite(
            @RequestParam int userId,
            @RequestParam int bookId
    ) {
        userService.addFavourite(userId, bookId);
        return ResponseEntity.ok("Added to favourites");
    }

    @DeleteMapping("/favourite/{id}")
    public ResponseEntity<Void> deleteFavourite(@PathVariable int id) {
        userService.deleteFavourite(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favourites/{userId}")
    public ResponseEntity<List<FavouriteDTO>> getFavourites(@PathVariable int userId) {
        return ResponseEntity.ok(userService.getFavouritesById(userId));
    }

    // ================= REVIEWS =================

    @PostMapping("/review")
    public ResponseEntity<String> addReview(
            @RequestParam int rating,
            @RequestParam String comment,
            @RequestParam int userId,
            @RequestParam int bookId
    ) {
        userService.addReview(rating, comment, userId, bookId);
        return ResponseEntity.ok("Review added");
    }

    @PutMapping("/review/{id}")
    public ResponseEntity<String> updateReview(
            @PathVariable int id,
            @RequestBody ReviewDTO reviewDTO
    ) {
        userService.updateReview(id, reviewDTO);
        return ResponseEntity.ok("Review updated");
    }

    @DeleteMapping("/review/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable int id) {
        userService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    // ================= ISSUED =================

    @GetMapping("/issued/{userId}")
    public ResponseEntity<List<IssuedBookDTO>> getIssuedBooks(@PathVariable int userId) {
        return ResponseEntity.ok(userService.getIssuedBookById(userId));
    }

    // ================= USER =================

    @PostMapping("/add")
    public ResponseEntity<String> addUser(@RequestBody UserDTO userDTO) {
        try {
            userService.addUser(userDTO);
            return ResponseEntity.ok("User created");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(
            @PathVariable int id,
            @RequestBody UserDTO userDTO
    ) {
        userService.updateUser(id, userDTO);
        return ResponseEntity.ok("User updated");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable int userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // ================= FINE =================

    @GetMapping("/fine/{userId}")
    public ResponseEntity<Float> calculateFine(@PathVariable int userId) {
        return ResponseEntity.ok(userService.calculateFine(userId));
    }

    @GetMapping("/fine/book/{issueId}")
    public ResponseEntity<Float> calculateFinePerBook(@PathVariable int issueId) {
        return ResponseEntity.ok(userService.calculateFinePerBook(issueId));
    }

    @PutMapping("/fine/pay/{userId}")
    public ResponseEntity<Void> payFine(@PathVariable int userId) {
        userService.payFine(userId);
        return ResponseEntity.noContent().build();
    }
}