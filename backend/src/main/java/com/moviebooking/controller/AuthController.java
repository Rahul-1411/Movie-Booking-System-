package com.moviebooking.controller;

import com.moviebooking.dto.AuthDto;
import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    private static final String COOKIE_NAME = "jwt";

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request,
            HttpServletResponse response) {

        AuthDto.AuthResponse authResponse = authService.login(request);

        // ✅ Set JWT in an HttpOnly cookie — not accessible to JavaScript, mitigates XSS token theft
        Cookie cookie = new Cookie(COOKIE_NAME, authResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);   // set app.cookie.secure=true in production (HTTPS only)
        cookie.setPath("/");
        cookie.setMaxAge(jwtExpirationMs / 1000);
        response.addCookie(cookie);

        // Don't leak the raw token in the response body anymore
        authResponse.setToken(null);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0); // expire immediately
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", "ROLE_" + user.getRole().name()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}

