package com.afyaquik.hms.auth.jwt;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.SuperAdminUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class JwtService {

    private final JwtProperties properties;
    private Key signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        setSigningKey(properties.getSecret());
    }

    public void setSigningKey(String secret) {
        Assert.hasText(secret, "JWT secret must not be empty");
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(StaffUser user) {
        return generateToken(user, TokenType.ACCESS, properties.getAccessTokenTtlSeconds());
    }

    public String generateRefreshToken(StaffUser user) {
        return generateToken(user, TokenType.REFRESH, properties.getRefreshTokenTtlSeconds());
    }

    /**
     * Generate access token for Super Admin users
     */
    public String generateSuperAdminAccessToken(SuperAdminUser user) {
        return generateSuperAdminToken(user, TokenType.ACCESS, properties.getAccessTokenTtlSeconds());
    }

    /**
     * Generate refresh token for Super Admin users
     */
    public String generateSuperAdminRefreshToken(SuperAdminUser user) {
        return generateSuperAdminToken(user, TokenType.REFRESH, properties.getRefreshTokenTtlSeconds());
    }

    private String generateToken(StaffUser user, TokenType tokenType, long ttlSeconds) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);
        Map<String, Object> claims = Map.of(
                "tenant", user.getTenantId(),
                "username", user.getUsername(),
                "roles", user.getRoles().stream().map(StaffRole::getRoleKey).collect(Collectors.toList()),
                "tokenType", tokenType.name());

        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .addClaims(claims)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    private String generateSuperAdminToken(SuperAdminUser user, TokenType tokenType, long ttlSeconds) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);
        Map<String, Object> claims = Map.of(
                "superAdmin", true,
                "username", user.getUsername(),
                "roles", List.of("SUPER_ADMIN"),
                "tokenType", tokenType.name());

        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .addClaims(claims)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public JwtPrincipal parseToken(String token, TokenType expectedType) {
        try {
            Jws<Claims> result = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            Claims body = result.getBody();
            String tokenType = body.get("tokenType", String.class);
            if (!expectedType.name().equals(tokenType)) {
                throw new JwtException("Unexpected token type: " + tokenType);
            }
            Long userId = Long.valueOf(body.getSubject());
            String username = body.get("username", String.class);
            
            // Check if this is a Super Admin token
            Boolean isSuperAdmin = body.get("superAdmin", Boolean.class);
            if (Boolean.TRUE.equals(isSuperAdmin)) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) body.get("roles", List.class);
                return new JwtPrincipal(userId, username, null, roles); // No tenant for Super Admin
            } else {
                // Regular tenant-based token
                String tenant = body.get("tenant", String.class);
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) body.get("roles", List.class);
                return new JwtPrincipal(userId, username, tenant, roles);
            }
        } catch (JwtException | IllegalArgumentException ex) {
            throw new JwtVerificationException("Invalid or expired token", ex);
        }
    }

    public long getAccessTokenTtlSeconds() {
        return properties.getAccessTokenTtlSeconds();
    }

    public long getRefreshTokenTtlSeconds() {
        return properties.getRefreshTokenTtlSeconds();
    }
}
