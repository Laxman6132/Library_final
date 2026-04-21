package com.library.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
@Entity
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int waitingListId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private LocalDateTime requestDate;

    private int position;

    public int getWaitingListId() {
        return waitingListId;
    }

    public void setWaitingListId(int waitingListId) {
        this.waitingListId = waitingListId;
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

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    @Override
    public String toString() {
        return "WaitingList{" +
                "waitingListId=" + waitingListId +
                ", user=" + user +
                ", book=" + book +
                ", requestDate=" + requestDate +
                ", position=" + position +
                '}';
    }

    public WaitingList(int waitingListId, User user, Book book, LocalDateTime requestDate, int position) {
        this.waitingListId = waitingListId;
        this.user = user;
        this.book = book;
        this.requestDate = requestDate;
        this.position = position;
    }

    public WaitingList() {
    }
}
