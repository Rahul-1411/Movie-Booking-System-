package com.moviebooking.controller;

import com.moviebooking.dto.BookingDto;
import com.moviebooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // =========================
    // CREATE BOOKING
    // =========================
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingDto.BookingRequest request,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(
                bookingService.createBooking(request, auth.getName())
        );
    }

    // =========================
    // GET MY BOOKINGS
    // =========================
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<BookingDto.BookingResponse> bookings =
                bookingService.getUserBookings(auth.getName());

        return ResponseEntity.ok(bookings);
    }

    // =========================
    // GET BY REFERENCE
    // =========================
    @GetMapping("/reference/{ref}")
    public ResponseEntity<?> getBookingByReference(@PathVariable String ref) {
        return ResponseEntity.ok(
                bookingService.getBookingByReference(ref)
        );
    }

    // =========================
    // CANCEL BOOKING
    // =========================
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        bookingService.cancelBooking(id, auth.getName());
        return ResponseEntity.ok("Booking cancelled");
    }
}
