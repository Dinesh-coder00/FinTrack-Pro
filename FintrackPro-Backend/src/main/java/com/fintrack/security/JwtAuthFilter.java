package com.fintrack.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Servlet filter that runs once per request.
 *
 * <ol>
 *   <li>Reads the {@code Authorization: Bearer <token>} header.</li>
 *   <li>Validates the JWT via {@link JwtUtils}.</li>
 *   <li>Loads the matching {@link UserDetails} from the database.</li>
 *   <li>Injects an authenticated principal into the {@link SecurityContextHolder}.</li>
 * </ol>
 *
 * If any step fails the request is simply passed along without authentication,
 * and Spring Security's access rules will reject it if the endpoint is protected.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils               jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest  request,
                                    HttpServletResponse response,
                                    FilterChain         filterChain)
            throws ServletException, IOException {

        try {
            String jwt = extractJwt(request);

            if (jwt != null && jwtUtils.validateToken(jwt)) {

                String      email = jwtUtils.getEmailFromToken(jwt);
                UserDetails ud    = userDetailsService.loadUserByUsername(email);

                var authToken = new UsernamePasswordAuthenticationToken(
                        ud, null, ud.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception ex) {
            log.error("JWT authentication error: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract the raw JWT from the {@code Authorization} header.
     *
     * @return token string, or {@code null} if the header is absent / malformed
     */
    private String extractJwt(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
