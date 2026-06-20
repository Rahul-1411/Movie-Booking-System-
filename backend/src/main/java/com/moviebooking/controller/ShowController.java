package com.moviebooking.controller;

import com.moviebooking.dto.ShowDto;
import com.moviebooking.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    @Autowired
    private ShowService showService;

    @GetMapping
    public ResponseEntity<List<ShowDto.ShowResponse>> getAllShows() {
        return ResponseEntity.ok(showService.getAllActiveShows());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowDto.ShowResponse>> getShowsByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(showService.getShowsForMovie(movieId));
    }

    @GetMapping("/{showId}/seats")
    public ResponseEntity<ShowDto.ShowSeatLayoutResponse> getShowSeats(@PathVariable Long showId) {
        return ResponseEntity.ok(showService.getShowSeatLayout(showId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createShow(@RequestBody ShowDto.CreateShowRequest request) {
        showService.createShow(request);
        return ResponseEntity.ok().build();
    }
}
