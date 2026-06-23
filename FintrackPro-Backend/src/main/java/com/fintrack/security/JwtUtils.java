package com.fintrack.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility bean for generating, validating and parsing JWT tokens.
 *
 * Algorithm : HMAC-SHA256 (HS256)
 * Signing key: derived directly from the UTF-8 bytes of app.jwt.secret.
 *              The secret must be at least 32 characters (256 bits) long.
 */
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // ── Key construction ─────────────────────────────────────────────────────

    /**
     * Build an HMAC-SHA key directly from the raw UTF-8 bytes of the secret.
     * No Base64 encoding/decoding here — that was the source of the original bug.
     */
    private SecretKey signingKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Token generation ─────────────────────────────────────────────────────

    /**
     * Generate a signed JWT with the given email as the subject.
     *
     * @param email user's email address (the principal)
     * @return compact serialised JWT string
     */
    public String generateToken(String email) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    // ── Token parsing ────────────────────────────────────────────────────────

    /**
     * Extract the email (subject claim) from a valid token.
     *
     * @param token raw JWT string (without "Bearer " prefix)
     * @return email stored in the subject
     */
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Return {@code true} when the token is syntactically valid,
     * properly signed and not expired.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Covers: MalformedJwt, Expired, UnsupportedJwt, SignatureException
            return false;
        }
    }

    // ── Internal helper ──────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
