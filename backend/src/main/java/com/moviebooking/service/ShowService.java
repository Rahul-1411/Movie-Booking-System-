package com.moviebooking.service;

import com.moviebooking.dto.ShowDto;
import com.moviebooking.entity.*;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowService {

    @Autowired private ShowRepository showRepository;
    @Autowired private MovieRepository movieRepository;
    @Autowired private TheaterRepository theaterRepository;
    @Autowired private SeatRepository seatRepository;

    public List<ShowDto.ShowResponse> getShowsForMovie(Long movieId) {
        List<Show> shows = showRepository.findByMovieIdAndShowTimeAfter(movieId, LocalDateTime.now().minusHours(1));
        return shows.stream().map(this::mapToShowResponse).collect(Collectors.toList());
    }

    public ShowDto.ShowSeatLayoutResponse getShowSeatLayout(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found: " + showId));
        List<Seat> seats = seatRepository.findByShowId(showId);

        List<ShowDto.SeatResponse> seatResponses = seats.stream().map(seat ->
                ShowDto.SeatResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .row(seat.getRow())
                        .seatIndex(seat.getSeatIndex())
                        .status(seat.getStatus().name())
                        .seatType(seat.getSeatType().name())
                        .price(seat.getPrice())
                        .version(seat.getVersion())
                        .build()
        ).collect(Collectors.toList());

        long availableCount = seats.stream().filter(s -> s.getStatus() == Seat.SeatStatus.AVAILABLE).count();

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

    public List<ShowDto.ShowResponse> getAllActiveShows() {
        return showRepository.findAll().stream()
                .filter(s -> s.getStatus() == Show.ShowStatus.ACTIVE && s.getShowTime().isAfter(LocalDateTime.now()))
                .map(this::mapToShowResponse)
                .collect(Collectors.toList());
    }

    public Show createShow(ShowDto.CreateShowRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found"));

        Show show = new Show();
        show.setMovie(movie); show.setTheater(theater);
        show.setShowTime(request.getShowTime()); show.setPrice(request.getPrice());
        show.setTotalSeats(request.getTotalSeats()); show.setAvailableSeats(request.getTotalSeats());
        showRepository.save(show);

        // Generate seats
        List<Seat> seats = new ArrayList<>();
        String[] rows = {"A","B","C","D","E","F","G","H","I","J"};
        int seatsPerRow = request.getTotalSeats() / rows.length;
        for (int r = 0; r < rows.length; r++) {
            for (int s = 1; s <= seatsPerRow; s++) {
                Seat seat = new Seat();
                seat.setShow(show); seat.setRow(rows[r]);
                seat.setSeatNumber(rows[r] + s); seat.setSeatIndex(s);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setSeatType(r < 2 ? Seat.SeatType.PREMIUM : r >= 8 ? Seat.SeatType.RECLINER : Seat.SeatType.STANDARD);
                seat.setPrice(r < 2 ? request.getPrice() * 1.5 : r >= 8 ? request.getPrice() * 2.0 : request.getPrice());
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
        return show;
    }

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
