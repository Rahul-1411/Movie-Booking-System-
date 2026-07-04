package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String genre;
    private String language;
    private Integer duration;
    private String director;
    @Column(name = "movie_cast")
    private String cast;
    private LocalDate releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private Double rating;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NOW_SHOWING;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Show> shows;

    public enum Status {
        NOW_SHOWING, COMING_SOON, ENDED
    }
}
