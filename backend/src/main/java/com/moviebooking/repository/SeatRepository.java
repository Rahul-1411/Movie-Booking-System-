package com.moviebooking.repository;

import com.moviebooking.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowId(Long showId);

    List<Seat> findByShowIdAndStatus(Long showId, Seat.SeatStatus status);

    // ✅ OPTIMISTIC LOCKING: fetch seat with version check for concurrent booking
    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithOptimisticLock(@Param("id") Long id);

    // Bulk fetch with optimistic lock for multiple seat booking
    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids AND s.show.id = :showId")
    List<Seat> findByIdsAndShowIdWithOptimisticLock(@Param("ids") List<Long> ids, @Param("showId") Long showId);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.show.id = :showId AND s.status = 'AVAILABLE'")
    Integer countAvailableSeatsByShowId(@Param("showId") Long showId);
}
