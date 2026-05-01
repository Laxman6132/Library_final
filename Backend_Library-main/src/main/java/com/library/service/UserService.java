package com.library.service;

import com.library.dto.*;
import com.library.entity.Book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    // ================= BOOK =================
    List<BookDTO> getAllBook();

    Page<BookDTO> getBooksPaginated(Pageable pageable);

    BookDTO getBookById(int bookId);

    List<BookDTO> getBooksByGenre(String genre);

    List<BookDTO> getBooksByPrefix(String search);

    // ================= ISSUED =================
    List<IssuedBookDTO> getIssuedBookById(int userId);

    // ================= WAITING LIST =================
    boolean addWL(int userId, int bookId);

    void deleteWL(int wlId);

    List<WaitingListDTO> getWaitingListById(int userId);

    // ================= FAVOURITE =================
    void addFavourite(int userId, int bookId);

    void deleteFavourite(int favouriteId);

    List<FavouriteDTO> getFavouritesById(int userId);

    // ================= REVIEW =================
    void addReview(int rating, String comment, int userId, int bookId);

    void updateReview(int reviewId, ReviewDTO reviewDTO);

    void deleteReview(int reviewId);

    // ================= USER =================
    void addUser(UserDTO userDTO);

    void updateUser(int userId, UserDTO userDTO);

    void deleteUser(int userId);

    UserDTO getUserById(int userId);

    List<UserDTO> getAllUsers();

    // ================= FINE =================
    void payFine(int userId);

    float calculateFine(int userId);

    float calculateFinePerBook(int issueBookId);

    // ================ Filters ================
    List<BookDTO> popularBooks();
    List<BookDTO> latestBooks();
    List<BookDTO> recentBooks();   // fast — top 30 by ID desc, used by dashboards
    List<BookDTO> filterBooks(String title, String author, String genre, Double minRating, Integer minPages, Integer maxPages, Integer availableCopies);
    void bcrpt();
}