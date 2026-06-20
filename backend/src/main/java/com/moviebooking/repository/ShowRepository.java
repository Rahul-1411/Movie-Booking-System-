package com.moviebooking.repository;

import com.moviebooking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.showTime >= :from ORDER BY s.showTime ASC")
    List<Show> findByMovieIdAndShowTimeAfter(@Param("movieId") Long movieId, @Param("from") LocalDateTime from);

    List<Show> findByTheaterId(Long theaterId);

    @Query("SELECT s FROM Show s WHERE s.movie.id = :movieId AND s.theater.city = :city AND s.showTime >= :from")
    List<Show> findByMovieAndCity(@Param("movieId") Long movieId, @Param("city") String city, @Param("from") LocalDateTime from);

    @Query("SELECT s FROM Show s WHERE s.status = 'ACTIVE' AND s.showTime BETWEEN :start AND :end")
    List<Show> findActiveShowsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
