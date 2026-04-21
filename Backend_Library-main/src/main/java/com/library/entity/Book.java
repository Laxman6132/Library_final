package com.library.entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookId")
    private int bookId;
    private String author;
    private String title;
    private String description;

    @Column(unique = true)
    private String isbn;

    private int totalCopies;
    private int availableCopies;

    private String genre;

    private String qrCode;

    @OneToMany(mappedBy = "book")
    private List<Review> reviews;

    @OneToMany(mappedBy = "book")
    private List<IssuedBook> issuedBooks;

    @OneToMany(mappedBy = "book")
    private List<WaitingList> waitingList;

    @OneToMany(mappedBy = "book")
    private List<Interaction> interactions;
    @OneToMany(mappedBy = "book")
    private List<Favourite> favourites;

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
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

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    public List<IssuedBook> getIssuedBooks() {
        return issuedBooks;
    }

    public void setIssuedBooks(List<IssuedBook> issuedBooks) {
        this.issuedBooks = issuedBooks;
    }

    public List<WaitingList> getWaitingList() {
        return waitingList;
    }

    public void setWaitingList(List<WaitingList> waitingList) {
        this.waitingList = waitingList;
    }

    public List<Favourite> getFavourites() {
        return favourites;
    }

    public void setFavourites(List<Favourite> favourites) {
        this.favourites = favourites;
    }

    @Override
    public String toString() {
        return "Book{" +
                "bookId=" + bookId +
                ", author='" + author + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", isbn='" + isbn + '\'' +
                ", totalCopies=" + totalCopies +
                ", availableCopies=" + availableCopies +
                ", genre='" + genre + '\'' +
                ", qrCode='" + qrCode + '\'' +
                ", reviews=" + reviews +
                ", issuedBooks=" + issuedBooks +
                ", waitingList=" + waitingList +
                ", favourites=" + favourites +
                '}';
    }

    public Book(int bookId, String author, String title, String description, String isbn, int totalCopies, int availableCopies, String genre, String qrCode, List<Review> reviews, List<IssuedBook> issuedBooks, List<WaitingList> waitingList, List<Favourite> favourites) {
        this.bookId = bookId;
        this.author = author;
        this.title = title;
        this.description = description;
        this.isbn = isbn;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.genre = genre;
        this.qrCode = qrCode;
        this.reviews = reviews;
        this.issuedBooks = issuedBooks;
        this.waitingList = waitingList;
        this.favourites = favourites;
    }

    public Book() {
    }


}
