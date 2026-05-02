package com.library.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Entity
public class IssuedBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int issueId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private int finePaid;
    private LocalDateTime returnDate;
    
    @Column(name = "returned", columnDefinition = "TINYINT(1) NOT NULL DEFAULT 0")
    private boolean returned;

    @Override
    public String toString() {
        return "IssuedBook{" +
                "issueId=" + issueId +
                ", user=" + user +
                ", book=" + book +
                ", issueDate=" + issueDate +
                ", dueDate=" + dueDate +
                ", finePaid=" + finePaid +
                ", returnDate=" + returnDate +
                ", returned=" + returned +
                '}';
    }

    public int getFinePaid() {
        return finePaid;
    }

    public void setFinePaid(int finePaid) {
        this.finePaid = finePaid;
    }

    public int getIssueId() {
        return issueId;
    }

    public void setIssueId(int issueId) {
        this.issueId = issueId;
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

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public boolean isReturned() {
        return returned;
    }

    public void setReturned(boolean returned) {
        this.returned = returned;
    }

    public IssuedBook(int issueId, User user, Book book, LocalDateTime issueDate, LocalDateTime dueDate, int finePaid, LocalDateTime returnDate, boolean returned) {
        this.issueId = issueId;
        this.user = user;
        this.book = book;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.finePaid = finePaid;
        this.returnDate = returnDate;
        this.returned = returned;
    }

    public IssuedBook() {
    }
}
