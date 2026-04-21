package com.library.dto;

import java.time.LocalDateTime;

public class WaitingListDTO {

    private int waitingListId;
    private int userId;
    private int bookId;

    private LocalDateTime requestDate;
    private int position;

    @Override
    public String toString() {
        return "WaitingListDTO{" +
                "waitingListId=" + waitingListId +
                ", userId=" + userId +
                ", bookId=" + bookId +
                ", requestDate=" + requestDate +
                ", position=" + position +
                '}';
    }

    public WaitingListDTO() {
    }

    public WaitingListDTO(int waitingListId, int userId, int bookId, LocalDateTime requestDate, int position) {
        this.waitingListId = waitingListId;
        this.userId = userId;
        this.bookId = bookId;
        this.requestDate = requestDate;
        this.position = position;
    }

    public int getWaitingListId() {
        return waitingListId;
    }

    public void setWaitingListId(int waitingListId) {
        this.waitingListId = waitingListId;
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
}
