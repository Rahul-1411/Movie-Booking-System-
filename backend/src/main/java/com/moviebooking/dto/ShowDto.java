package com.moviebooking.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ShowDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowResponse {
        private Long id;
        private Long movieId;
        private String movieTitle;
        private Long theaterId;
        private String theaterName;
        private String theaterCity;
        private LocalDateTime showTime;
        private Double price;
        private Integer totalSeats;
        private Integer availableSeats;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatResponse {
        private Long id;
        private String seatNumber;
        private String row;
        private Integer seatIndex;
        private String status;
        private String seatType;
        private Double price;
        private Long version;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowSeatLayoutResponse {
        private Long showId;
        private String movieTitle;
        private String theaterName;
        private LocalDateTime showTime;
        private List<SeatResponse> seats;
        private Integer availableSeats;
        private Integer totalSeats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateShowRequest {
        private Long movieId;
        private Long theaterId;
        private LocalDateTime showTime;
        private Double price;
        private Integer totalSeats;
    }
}
