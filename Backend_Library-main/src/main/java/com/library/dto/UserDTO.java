package com.library.dto;

public class UserDTO {

    private Integer userId;
    private String userName;
    private String emailId;
    private String password;
    private String role;
    private String gender;
    private String address;
    private Long phNo;
    private Float fine;
    private String qrCode;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", emailId='" + emailId + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                ", gender='" + gender + '\'' +
                ", address='" + address + '\'' +
                ", phNo=" + phNo +
                ", fine=" + fine +
                ", qrCode='" + qrCode + '\'' +
                '}';
    }

    public UserDTO() {
    }

    public UserDTO(Integer userId, String userName, String emailId, String password, String role, String gender, String address, Long phNo, Float fine, String qrCode) {
        this.userId = userId;
        this.userName = userName;
        this.emailId = emailId;
        this.password = password;
        this.role = role;
        this.gender = gender;
        this.address = address;
        this.phNo = phNo != null ? phNo : 0L;
        this.fine = fine != null ? fine : 0.0f;
        this.qrCode = qrCode;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
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

    public Long getPhNo() {
        return phNo;
    }

    public void setPhNo(Long phNo) {
        this.phNo = phNo;
    }

    public Float getFine() {
        return fine;
    }

    public void setFine(Float fine) {
        this.fine = fine;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
}