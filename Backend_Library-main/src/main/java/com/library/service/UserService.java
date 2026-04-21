package com.library.service;

import com.library.dto.*;

import java.util.List;

public interface UserService {

    // ================= BOOK =================
    List<BookDTO> getAllBook();

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
    void bcrpt();
}