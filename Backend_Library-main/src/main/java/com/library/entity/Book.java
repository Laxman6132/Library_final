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
    @Column(name = "description", columnDefinition = "TEXT NOT NULL")
    private String description;
    private String genre;
    private int pages;
    @Column(unique = true)
    private String isbn;
    private String isbn_10;
    private String image;
    private int totalCopies;
    private int availableCopies;
    private double rating;
    @ManyToMany
    private List<Genre> genres;

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

    public String getIsbn_10() {
        return isbn_10;
    }

    public void setIsbn_10(String isbn_10) {
        this.isbn_10 = isbn_10;
    }

    public List<Genre> getGenre() {
        return genres;
    }

    public void setGenre(List<Genre> genres) {
        this.genres = genres;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getPages() {
        return pages;
    }

    public void setPages(int pages) {
        this.pages = pages;
    }

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

    public List<Interaction> getInteractions() {
        return interactions;
    }

    public void setInteractions(List<Interaction> interactions) {
        this.interactions = interactions;
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
                ", genre='" + genre + '\'' +
                ", pages=" + pages +
                ", isbn='" + isbn + '\'' +
                ", isbn_10='" + isbn_10 + '\'' +
                ", image='" + image + '\'' +
                ", totalCopies=" + totalCopies +
                ", availableCopies=" + availableCopies +
                ", rating=" + rating +
                ", genres=" + genres +
                ", qrCode='" + qrCode + '\'' +
                ", reviews=" + reviews +
                ", issuedBooks=" + issuedBooks +
                ", waitingList=" + waitingList +
                ", interactions=" + interactions +
                ", favourites=" + favourites +
                '}';
    }

    public Book(int bookId, String author, String title, String description, String genre, int pages, String isbn, String isbn_10, String image, int totalCopies, int availableCopies, double rating, List<Genre> genres, String qrCode, List<Review> reviews, List<IssuedBook> issuedBooks, List<WaitingList> waitingList, List<Interaction> interactions, List<Favourite> favourites) {
        this.bookId = bookId;
        this.author = author;
        this.title = title;
        this.description = description;
        this.genre = genre;
        this.pages = pages;
        this.isbn = isbn;
        this.isbn_10 = isbn_10;
        this.image = image;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.rating = rating;
        this.genres = genres;
        this.qrCode = qrCode;
        this.reviews = reviews;
        this.issuedBooks = issuedBooks;
        this.waitingList = waitingList;
        this.interactions = interactions;
        this.favourites = favourites;
    }

    public Book() {
    }


}
