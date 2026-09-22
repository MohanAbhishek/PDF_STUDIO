package com.example.pdfstudio.dto;

public class AuthResponse {
    private String jwtToken;
    private String userEmail;
    private String fullName;

    public AuthResponse() {}

    public AuthResponse(String jwtToken, String userEmail, String fullName) {
        this.jwtToken = jwtToken;
        this.userEmail = userEmail;
        this.fullName = fullName;
    }

    public String getJwtToken() { return jwtToken; }
    public void setJwtToken(String jwtToken) { this.jwtToken = jwtToken; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}