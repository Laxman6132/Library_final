package com.library.dto;

import com.library.dto.FavouriteDTO;
import com.library.dto.ReviewDTO;
import com.library.entity.Genre;

import java.util.List;

public class BookDTO {

    private int bookId;
    private String title;
    private String description;
    private String isbn;
    private int totalCopies;
    private int availableCopies;
    private List<Genre> genre;
    private String qrCode;
    
    private String author;
    private int pages;
    private String image;

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
                ", author='" + author + '\'' +
                ", pages=" + pages +
                ", image='" + image + '\'' +
                ", reviews=" + reviews +
                ", favourites=" + favourites +
                '}';
    }

    public BookDTO() {
    }

    public BookDTO(int bookId, String title, String description, String isbn, int totalCopies, int availableCopies, List<Genre> genre, String qrCode, String author, int pages, String image, List<ReviewDTO> reviews, List<FavouriteDTO> favourites) {
        this.bookId = bookId;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.genre = genre;
        this.qrCode = qrCode;
        this.author = author;
        this.pages = pages;
        this.image = image;
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

    public List<Genre> getGenre() {
        return genre;
    }

    public void setGenre(List<Genre> genre) {
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

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public int getPages() {
        return pages;
    }

    public void setPages(int pages) {
        this.pages = pages;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}