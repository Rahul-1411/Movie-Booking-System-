package com.moviebooking.controller;

import com.moviebooking.entity.Theater;
import com.moviebooking.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    @Autowired
    private TheaterRepository theaterRepository;

    @GetMapping
    public ResponseEntity<List<Theater>> getAllTheaters(@RequestParam(required = false) String city) {
        if (city != null) return ResponseEntity.ok(theaterRepository.findByCityIgnoreCase(city));
        return ResponseEntity.ok(theaterRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Theater> createTheater(@RequestBody Theater theater) {
        return ResponseEntity.ok(theaterRepository.save(theater));
    }
}
