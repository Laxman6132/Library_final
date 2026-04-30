package com.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private int userId;
    private String userName;

    @Column(unique = true, nullable = false)
    private String emailId;

    private String role;
    private String password;
    private String gender;
    private String address;

    private long phNo;
    private float fine;

    private String qrCode;
    private String qrToken;

    @OneToMany(mappedBy = "user")
    private List<Review> reviews;

    @OneToMany(mappedBy = "user")
    private List<IssuedBook> issuedBooks;

    @OneToMany(mappedBy = "user")
    private List<WaitingList> waitingList;

    @OneToMany(mappedBy = "user")
    private List<Favourite> favourites;
    @OneToMany(mappedBy = "user")
    private List<Interaction> interactions;

    public List<Interaction> getInteractions() {
        return interactions;
    }

    public void setInteractions(List<Interaction> interactions) {
        this.interactions = interactions;
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

    public String getEmailId() {
        return emailId;
    }

    public void setEmailId(String emailId) {
        this.emailId = emailId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public long getPhNo() {
        return phNo;
    }

    public void setPhNo(long phNo) {
        this.phNo = phNo;
    }

    public float getFine() {
        return fine;
    }

    public void setFine(float fine) {
        this.fine = fine;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
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
        return "User{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", emailId='" + emailId + '\'' +
                ", role='" + role + '\'' +
                ", password='" + password + '\'' +
                ", gender='" + gender + '\'' +
                ", address='" + address + '\'' +
                ", phNo=" + phNo +
                ", fine=" + fine +
                ", qrCode='" + qrCode + '\'' +
                ", qrToken='" + qrToken + '\'' +
                ", reviews=" + reviews +
                ", issuedBooks=" + issuedBooks +
                ", waitingList=" + waitingList +
                ", favourites=" + favourites +
                ", interactions=" + interactions +
                '}';
    }

    public User(int userId, String userName, String emailId, String role, String password, String gender,
            String address, long phNo, float fine, String qrCode, String qrToken, List<Review> reviews,
            List<IssuedBook> issuedBooks, List<WaitingList> waitingList, List<Favourite> favourites,
            List<Interaction> interactions) {
        this.userId = userId;
        this.userName = userName;
        this.emailId = emailId;
        this.role = role;
        this.password = password;
        this.gender = gender;
        this.address = address;
        this.phNo = phNo;
        this.fine = fine;
        this.qrCode = qrCode;
        this.qrToken = qrToken;
        this.reviews = reviews;
        this.issuedBooks = issuedBooks;
        this.waitingList = waitingList;
        this.favourites = favourites;
        this.interactions = interactions;
    }

    public User() {
    }
}