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
    @Autowired private EmailService emailService;

    @Transactional
    public BookingDto.BookingResponse createBooking(
            BookingDto.BookingRequest request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found"));

        if (show.getStatus() != Show.ShowStatus.ACTIVE) {
            throw new SeatNotAvailableException("This show is no longer active");
        }

        List<Seat> seats = seatRepository.findByIdsAndShowIdWithOptimisticLock(
                request.getSeatIds(), request.getShowId());

        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException(
                    "One or more seats not found for this show");
        }

        List<String> unavailableSeats = seats.stream()
                .filter(s -> s.getStatus() != Seat.SeatStatus.AVAILABLE)
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

        if (!unavailableSeats.isEmpty()) {
            throw new SeatNotAvailableException(
                    "Seats not available: " + String.join(", ", unavailableSeats));
        }

        seats.forEach(seat -> seat.setStatus(Seat.SeatStatus.BOOKED));
        try {
            seatRepository.saveAll(seats);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new SeatNotAvailableException(
                    "Seats were just taken by another user. Please select different seats.");
        }

        show.setAvailableSeats(show.getAvailableSeats() - seats.size());
        showRepository.save(show);

        double totalAmount = seats.stream().mapToDouble(Seat::getPrice).sum();

        Booking booking = new Booking();
        booking.setBookingReference(
                "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setShow(show);
        booking.setSeats(seats);
        booking.setTotalAmount(totalAmount);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        log.info("Booking confirmed: {} for user: {}",
                booking.getBookingReference(), username);

        // Send email (never fails the booking)
        try {
            String seatNumbers = seats.stream()
                    .map(Seat::getSeatNumber)
                    .collect(Collectors.joining(", "));

            emailService.sendBookingEmail(
                    user.getEmail(),
                    user.getFullName() != null ? user.getFullName() : user.getUsername(),
                    booking.getBookingReference(),
                    show.getMovie().getTitle(),
                    show.getTheater().getName(),
                    show.getShowTime().toString(),
                    seatNumbers,
                    totalAmount
            );
        } catch (Exception e) {
            log.error("Unable to send booking email: {}", e.getMessage());
        }

        return mapToBookingResponse(booking);
    }

    // ✅ Added @Transactional so lazy loading works
    @Transactional(readOnly = true)
    public List<BookingDto.BookingResponse> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ✅ Use eager fetch query instead of basic findByUserId
        return bookingRepository.findByUserIdWithDetails(user.getId())
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    // ✅ Added @Transactional so lazy loading works
    @Transactional(readOnly = true)
    public BookingDto.BookingResponse getBookingByReference(String reference) {
        return mapToBookingResponse(
                bookingRepository.findByBookingReferenceWithDetails(reference)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Booking not found: " + reference))
        );
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
        booking.getSeats().forEach(s -> s.setStatus(Seat.SeatStatus.AVAILABLE));
        seatRepository.saveAll(booking.getSeats());
        Show show = booking.getShow();
        show.setAvailableSeats(show.getAvailableSeats() + booking.getSeats().size());
        showRepository.save(show);
    }

    private BookingDto.BookingResponse mapToBookingResponse(Booking booking) {
        List<String> seatNumbers = booking.getSeats().stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

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