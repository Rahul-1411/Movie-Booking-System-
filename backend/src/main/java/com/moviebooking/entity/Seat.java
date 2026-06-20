package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", nullable = false)
    @JsonIgnore
    private Show show;

    private String seatNumber;

    @Column(name = "row_label")
    private String row;

    private Integer seatIndex;

    @Enumerated(EnumType.STRING)
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    private SeatType seatType = SeatType.STANDARD;

    private Double price;

    @Version
    private Long version;

    public enum SeatStatus {
        AVAILABLE, BOOKED
    }

    public enum SeatType {
        STANDARD, PREMIUM, RECLINER
    }
}
