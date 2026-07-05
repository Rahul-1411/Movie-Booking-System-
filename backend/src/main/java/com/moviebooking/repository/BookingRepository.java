package com.moviebooking.repository;

import com.moviebooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ✅ Original methods — keep these
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByShowId(Long showId);

    // ✅ New — fetches show + movie + theater + seats in ONE query
    // Fixes the lazy loading 500 error on /api/bookings/my
    @Query("SELECT DISTINCT b FROM Booking b " +
            "JOIN FETCH b.show s " +
            "JOIN FETCH s.movie " +
            "JOIN FETCH s.theater " +
            "LEFT JOIN FETCH b.seats " +
            "WHERE b.user.id = :userId " +
            "ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    // ✅ New — same for single booking by reference
    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.show s " +
            "JOIN FETCH s.movie " +
            "JOIN FETCH s.theater " +
            "LEFT JOIN FETCH b.seats " +
            "WHERE b.bookingReference = :ref")
    Optional<Booking> findByBookingReferenceWithDetails(@Param("ref") String ref);
}