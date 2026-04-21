package com.library.dto;

import java.time.LocalDateTime;

public class FavouriteDTO {

    private int favouriteId;
    private int userId;   // only ID, not full User
    private int bookId;   // only ID, not full Book
    private LocalDateTime addedDate;

    @Override
    public String toString() {
        return "FavouriteDTO{" +
                "favouriteId=" + favouriteId +
                ", userId=" + userId +
                ", bookId=" + bookId +
                ", addedDate=" + addedDate +
                '}';
    }

    public FavouriteDTO() {
    }

    public FavouriteDTO(int favouriteId, int userId, int bookId, LocalDateTime addedDate) {
        this.favouriteId = favouriteId;
        this.userId = userId;
        this.bookId = bookId;
        this.addedDate = addedDate;
    }

    public int getFavouriteId() {
        return favouriteId;
    }

    public void setFavouriteId(int favouriteId) {
        this.favouriteId = favouriteId;
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

    public LocalDateTime getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }
}