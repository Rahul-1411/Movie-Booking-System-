package com.moviebooking.service;

import com.moviebooking.dto.BookingDto;
import com.moviebooking.entity.*;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.exception.SeatNotAvailableException;
import com.moviebooking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.MessagingException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired private BookingRepository bookingRepository;
    @Autowired private SeatRepository seatRepository;
    @Autowired private ShowRepository showRepository;
    @Autowired private UserRepository userRepository;
    @Autowired
    private EmailService emailService;




    /**
     * ✅ OPTIMISTIC LOCKING: Creates and confirms a booking in a single step.
     * The @Version field on Seat entity ensures two users can't book the same seat
     * simultaneously — if a conflict occurs, ObjectOptimisticLockingFailureException
     * is thrown and translated into a 409 Conflict by the global exception handler.
     */
    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.BookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found"));

        if (show.getStatus() != Show.ShowStatus.ACTIVE) {
            throw new SeatNotAvailableException("This show is no longer active");
        }

        // ✅ Fetch seats with OPTIMISTIC lock — version check happens on save
        List<Seat> seats = seatRepository.findByIdsAndShowIdWithOptimisticLock(
                request.getSeatIds(), request.getShowId()
        );

        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException("One or more seats not found for this show");
        }

        // ✅ Validate all seats are AVAILABLE
        List<String> unavailableSeats = seats.stream()
                .filter(s -> s.getStatus() != Seat.SeatStatus.AVAILABLE)
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

        if (!unavailableSeats.isEmpty()) {
            throw new SeatNotAvailableException("Seats not available: " + String.join(", ", unavailableSeats));
        }

        // ✅ Mark seats BOOKED atomically — fails with OptimisticLockingFailureException
        // if another transaction already modified these seats (concurrent booking attempt)
        seats.forEach(seat -> seat.setStatus(Seat.SeatStatus.BOOKED));
        try {
            seatRepository.saveAll(seats); // version incremented here; conflict throws exception
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new SeatNotAvailableException(
                "Seats were just taken by another user. Please select different seats."
            );
        }

        // Update available seat count
        show.setAvailableSeats(show.getAvailableSeats() - seats.size());
        showRepository.save(show);

        // Calculate total amount
        double totalAmount = seats.stream().mapToDouble(Seat::getPrice).sum();

        // Create booking record — confirmed immediately, no payment gateway
        Booking booking = new Booking();
        booking.setBookingReference("BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setShow(show);
        booking.setSeats(seats);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

// Convert seat list into A1, A2, A3...
        String seatNumbers = booking.getSeats()
                .stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.joining(", "));

// Send Email
        try {

            emailService.sendBookingEmail(
                    booking.getUser().getEmail(),
                    booking.getUser().getFullName(),
                    booking.getBookingReference(),
                    booking.getShow().getMovie().getTitle(),
                    booking.getShow().getTheater().getName(),
                    booking.getShow().getShowTime().toString(),
                    seatNumbers,
                    booking.getTotalAmount()
            );

        } catch (Exception e) {

            log.error("Unable to send booking email", e);

        }

        log.info("Booking confirmed: {} for user: {}", booking.getBookingReference(), username);

        return mapToBookingResponse(booking);
    }

    public List<BookingDto.BookingResponse> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingDto.BookingResponse getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + reference));
        return mapToBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        releaseSeats(booking);
        bookingRepository.save(booking);
    }

    private void releaseSeats(Booking booking) {
        booking.getSeats().forEach(seat -> seat.setStatus(Seat.SeatStatus.AVAILABLE));
        seatRepository.saveAll(booking.getSeats());
        Show show = booking.getShow();
        show.setAvailableSeats(show.getAvailableSeats() + booking.getSeats().size());
        showRepository.save(show);
    }

    private BookingDto.BookingResponse mapToBookingResponse(Booking booking) {
        List<String> seatNumbers = booking.getSeats().stream()
                .map(Seat::getSeatNumber).collect(Collectors.toList());
        return BookingDto.BookingResponse.builder()
                .bookingId(booking.getId())
                .bookingReference(booking.getBookingReference())
                .movieTitle(booking.getShow().getMovie().getTitle())
                .theaterName(booking.getShow().getTheater().getName())
                .showTime(booking.getShow().getShowTime())
                .seats(seatNumbers)
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
