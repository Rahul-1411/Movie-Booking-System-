package com.moviebooking.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        private Long showId;
        private List<Long> seatIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private Long bookingId;
        private String bookingReference;
        private String movieTitle;
        private String theaterName;
        private LocalDateTime showTime;
        private List<String> seats;
        private Double totalAmount;
        private String status;
        private LocalDateTime createdAt;
    }
}
