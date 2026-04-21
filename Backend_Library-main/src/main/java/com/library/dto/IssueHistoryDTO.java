package com.library.dto;

import java.time.LocalDateTime;

public class IssueHistoryDTO {

    private int historyId;
    private int userId;
    private int bookId;

    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;

    @Override
    public String toString() {
        return "IssueHistoryDTO{" +
                "historyId=" + historyId +
                ", userId=" + userId +
                ", bookId=" + bookId +
                ", issueDate=" + issueDate +
                ", dueDate=" + dueDate +
                ", returnDate=" + returnDate +
                ", finePaid=" + finePaid +
                '}';
    }

    public IssueHistoryDTO() {
    }

    private int finePaid;

    public IssueHistoryDTO(int historyId, int userId, int bookId, LocalDateTime issueDate, LocalDateTime dueDate, LocalDateTime returnDate, int finePaid) {
        this.historyId = historyId;
        this.userId = userId;
        this.bookId = bookId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.finePaid = finePaid;
    }

    public int getHistoryId() {
        return historyId;
    }

    public void setHistoryId(int historyId) {
        this.historyId = historyId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
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

    public int getFinePaid() {
        return finePaid;
    }

    public void setFinePaid(int finePaid) {
        this.finePaid = finePaid;
    }
}