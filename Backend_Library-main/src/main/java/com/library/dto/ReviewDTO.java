package com.library.dto;

import java.time.LocalDateTime;

public class ReviewDTO {

    private int reviewId;
    private int rating;
    private String comment;
    private LocalDateTime time;

    private int userId;

    @Override
    public String toString() {
        return "ReviewDTO{" +
                "reviewId=" + reviewId +
                ", rating=" + rating +
                ", comment='" + comment + '\'' +
                ", time=" + time +
                ", userId=" + userId +
                ", userName='" + userName + '\'' +
                '}';
    }

    public ReviewDTO() {
    }

    public ReviewDTO(int reviewId, int rating, String comment, LocalDateTime time, int userId, String userName) {
        this.reviewId = reviewId;
        this.rating = rating;
        this.comment = comment;
        this.time = time;
        this.userId = userId;
        this.userName = userName;
    }

    public int getReviewId() {
        return reviewId;
    }

    public void setReviewId(int reviewId) {
        this.reviewId = reviewId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    private String userName; // useful for UI

}