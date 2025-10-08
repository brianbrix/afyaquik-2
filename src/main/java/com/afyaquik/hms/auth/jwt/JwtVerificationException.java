package com.afyaquik.hms.auth.jwt;

public class JwtVerificationException extends RuntimeException {

    public JwtVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
