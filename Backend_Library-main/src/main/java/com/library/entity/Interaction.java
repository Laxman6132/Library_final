package com.library.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Interaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int interactionId;
    private String interactionType;
    private int rating;
    private LocalDateTime dateTime;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    public int getInteractionId() {
        return interactionId;
    }

    public void setInteractionId(int interactionId) {
        this.interactionId = interactionId;
    }

    public String getInteractionType() {
        return interactionType;
    }

    public void setInteractionType(String interactionType) {
        this.interactionType = interactionType;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Interaction(int interactionId, String interactionType, int rating, LocalDateTime dateTime, User user, Book book) {
        this.interactionId = interactionId;
        this.interactionType = interactionType;
        this.rating = rating;
        this.dateTime = dateTime;
        this.user = user;
        this.book = book;
    }

    public Interaction() {
    }

    @Override
    public String toString() {
        return "Interaction{" +
                "interactionId=" + interactionId +
                ", interactionType='" + interactionType + '\'' +
                ", rating=" + rating +
                ", dateTime=" + dateTime +
                ", user=" + user +
                ", book=" + book +
                '}';
    }
}
