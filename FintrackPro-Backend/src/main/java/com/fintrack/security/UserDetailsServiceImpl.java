package com.fintrack.security;

import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * Integrates FinTrack's {@link User} entity with Spring Security's
 * {@link UserDetailsService} contract.
 *
 * Spring Security calls {@link #loadUserByUsername(String)} with the email
 * as the "username".
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for email: " + email));

        Collection<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_USER"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities);
    }
}
