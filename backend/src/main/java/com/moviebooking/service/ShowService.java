package com.moviebooking.service;

import com.moviebooking.dto.ShowDto;
import com.moviebooking.entity.*;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private SeatRepository seatRepository;

    // =========================
    // GET SHOWS BY MOVIE
    // =========================
    @Transactional(readOnly = true)
    public List<ShowDto.ShowResponse> getShowsForMovie(Long movieId) {

        List<Show> shows = showRepository.findByMovie_Id(movieId);

        return shows.stream()
                .map(this::mapToShowResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // GET SHOW SEAT LAYOUT
    // =========================
    @Transactional(readOnly = true)
    public ShowDto.ShowSeatLayoutResponse getShowSeatLayout(Long showId) {

        Show show = showRepository.findById(showId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Show not found: " + showId));

        List<Seat> seats = seatRepository.findByShowId(showId);

        List<ShowDto.SeatResponse> seatResponses = seats.stream()
                .map(seat -> ShowDto.SeatResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .row(seat.getRow())
                        .seatIndex(seat.getSeatIndex())
                        .status(seat.getStatus().name())
                        .seatType(seat.getSeatType().name())
                        .price(seat.getPrice())
                        .version(seat.getVersion())
                        .build())
                .collect(Collectors.toList());

        long availableCount = seats.stream()
                .filter(s -> s.getStatus() == Seat.SeatStatus.AVAILABLE)
                .count();

        return ShowDto.ShowSeatLayoutResponse.builder()
                .showId(showId)
                .movieTitle(show.getMovie().getTitle())
                .theaterName(show.getTheater().getName())
                .showTime(show.getShowTime())
                .seats(seatResponses)
                .availableSeats((int) availableCount)
                .totalSeats(seats.size())
                .build();
    }

    // =========================
    // GET ALL SHOWS (ADMIN / FRONTEND)
    // =========================
    @Transactional(readOnly = true)
    public List<ShowDto.ShowResponse> getAllActiveShows() {

        return showRepository.findAll()
                .stream()
                .filter(show -> show.getStatus() == Show.ShowStatus.ACTIVE)
                .map(this::mapToShowResponse)
                .collect(Collectors.toList());
    }

    // =========================
    // CREATE SHOW
    // =========================
    @Transactional
    public Show createShow(ShowDto.CreateShowRequest request) {

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Movie not found"));

        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Theater not found"));

        Show show = new Show();
        show.setMovie(movie);
        show.setTheater(theater);
        show.setShowTime(request.getShowTime());
        show.setPrice(request.getPrice());
        show.setTotalSeats(request.getTotalSeats());
        show.setAvailableSeats(request.getTotalSeats());
        show.setStatus(Show.ShowStatus.ACTIVE);

        show = showRepository.save(show);

        // =========================
        // GENERATE SEATS
        // =========================
        List<Seat> seats = new ArrayList<>();

        String[] rows = {"A","B","C","D","E","F","G","H","I","J"};
        int seatsPerRow = request.getTotalSeats() / rows.length;

        for (int r = 0; r < rows.length; r++) {
            for (int s = 1; s <= seatsPerRow; s++) {

                Seat seat = new Seat();
                seat.setShow(show);
                seat.setRow(rows[r]);
                seat.setSeatNumber(rows[r] + s);
                seat.setSeatIndex(s);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);

                if (r < 2) {
                    seat.setSeatType(Seat.SeatType.PREMIUM);
                    seat.setPrice(request.getPrice() * 1.5);
                } else if (r >= 8) {
                    seat.setSeatType(Seat.SeatType.RECLINER);
                    seat.setPrice(request.getPrice() * 2.0);
                } else {
                    seat.setSeatType(Seat.SeatType.STANDARD);
                    seat.setPrice(request.getPrice());
                }

                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);

        return show;
    }

    // =========================
    // MAPPER
    // =========================
    private ShowDto.ShowResponse mapToShowResponse(Show show) {

        return ShowDto.ShowResponse.builder()
                .id(show.getId())
                .movieId(show.getMovie().getId())
                .movieTitle(show.getMovie().getTitle())
                .theaterId(show.getTheater().getId())
                .theaterName(show.getTheater().getName())
                .theaterCity(show.getTheater().getCity())
                .showTime(show.getShowTime())
                .price(show.getPrice())
                .totalSeats(show.getTotalSeats())
                .availableSeats(show.getAvailableSeats())
                .status(show.getStatus().name())
                .build();
    }
}