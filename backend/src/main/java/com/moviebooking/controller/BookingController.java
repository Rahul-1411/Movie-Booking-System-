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

    /**
     * Creates and confirms a booking in one step.
     * Seat availability is protected by optimistic locking (@Version on Seat)
     * to prevent two users from booking the same seat concurrently.
     */
    @PostMapping
    public ResponseEntity<BookingDto.BookingResponse> createBooking(
            @RequestBody BookingDto.BookingRequest request,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.createBooking(request, auth.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDto.BookingResponse>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getUserBookings(auth.getName()));
    }

    @GetMapping("/reference/{ref}")
    public ResponseEntity<BookingDto.BookingResponse> getBookingByReference(@PathVariable String ref) {
        return ResponseEntity.ok(bookingService.getBookingByReference(ref));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id, Authentication auth) {
        bookingService.cancelBooking(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}
