package com.library.dto;

import com.library.dto.FavouriteDTO;
import com.library.dto.ReviewDTO;

import java.util.List;

public class BookDTO {

    private int bookId;
    private String title;
    private String description;
    private String isbn;
    private int totalCopies;
    private int availableCopies;
    private String genre;
    private String qrCode;

    // Only lightweight data
    private List<ReviewDTO> reviews;
    private List<FavouriteDTO> favourites;

    @Override
    public String toString() {
        return "BookDTO{" +
                "bookId=" + bookId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", isbn='" + isbn + '\'' +
                ", totalCopies=" + totalCopies +
                ", availableCopies=" + availableCopies +
                ", genre='" + genre + '\'' +
                ", qrCode='" + qrCode + '\'' +
                ", reviews=" + reviews +
                ", favourites=" + favourites +
                '}';
    }

    public BookDTO() {
    }

    public BookDTO(int bookId, String title, String description, String isbn, int totalCopies, int availableCopies, String genre, String qrCode, List<ReviewDTO> reviews, List<FavouriteDTO> favourites) {
        this.bookId = bookId;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.genre = genre;
        this.qrCode = qrCode;
        this.reviews = reviews;
        this.favourites = favourites;
    }

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public int getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(int totalCopies) {
        this.totalCopies = totalCopies;
    }

    public int getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(int availableCopies) {
        this.availableCopies = availableCopies;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public List<ReviewDTO> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewDTO> reviews) {
        this.reviews = reviews;
    }

    public List<FavouriteDTO> getFavourites() {
        return favourites;
    }

    public void setFavourites(List<FavouriteDTO> favourites) {
        this.favourites = favourites;
    }
}