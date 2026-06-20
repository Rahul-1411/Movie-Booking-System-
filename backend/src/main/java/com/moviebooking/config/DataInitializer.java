package com.moviebooking.config;

import com.moviebooking.entity.*;
import com.moviebooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private MovieRepository movieRepository;
    @Autowired private TheaterRepository theaterRepository;
    @Autowired private ShowRepository showRepository;
    @Autowired private SeatRepository seatRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // ✅ Guard against re-seeding on every restart now that data persists in MySQL
        if (userRepository.count() > 0) {
            System.out.println("ℹ️  Data already present — skipping sample data seed.");
            return;
        }

        // Users
        User admin = new User();
        admin.setUsername("admin"); admin.setEmail("admin@movie.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Admin User"); admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);

        User user = new User();
        user.setUsername("john"); user.setEmail("john@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFullName("John Doe"); user.setPhone("9876543210");
        userRepository.save(user);

        // Movies
        Movie m1 = new Movie(); m1.setTitle("Inception"); m1.setGenre("Sci-Fi");
        m1.setLanguage("English"); m1.setDuration(148); m1.setDirector("Christopher Nolan");
        m1.setCast("Leonardo DiCaprio, Ellen Page"); m1.setReleaseDate(LocalDate.of(2010, 7, 16));
        m1.setRating(8.8); m1.setStatus(Movie.Status.NOW_SHOWING);
        m1.setDescription("A thief who steals corporate secrets through the use of dream-sharing technology.");
        m1.setPosterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400");
        movieRepository.save(m1);

        Movie m2 = new Movie(); m2.setTitle("The Dark Knight"); m2.setGenre("Action");
        m2.setLanguage("English"); m2.setDuration(152); m2.setDirector("Christopher Nolan");
        m2.setCast("Christian Bale, Heath Ledger"); m2.setReleaseDate(LocalDate.of(2008, 7, 18));
        m2.setRating(9.0); m2.setStatus(Movie.Status.NOW_SHOWING);
        m2.setDescription("Batman faces the Joker, a criminal mastermind who plunges Gotham City into chaos.");
        m2.setPosterUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400");
        movieRepository.save(m2);

        Movie m3 = new Movie(); m3.setTitle("Interstellar"); m3.setGenre("Sci-Fi");
        m3.setLanguage("English"); m3.setDuration(169); m3.setDirector("Christopher Nolan");
        m3.setCast("Matthew McConaughey, Anne Hathaway"); m3.setReleaseDate(LocalDate.of(2014, 11, 7));
        m3.setRating(8.6); m3.setStatus(Movie.Status.NOW_SHOWING);
        m3.setDescription("Explorers travel through a wormhole in space to save humanity.");
        m3.setPosterUrl("https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400");
        movieRepository.save(m3);

        Movie m4 = new Movie(); m4.setTitle("Avatar 3"); m4.setGenre("Fantasy");
        m4.setLanguage("English"); m4.setDuration(180); m4.setDirector("James Cameron");
        m4.setCast("Sam Worthington, Zoe Saldana"); m4.setReleaseDate(LocalDate.of(2025, 12, 19));
        m4.setRating(0.0); m4.setStatus(Movie.Status.COMING_SOON);
        m4.setDescription("The next chapter in the Avatar saga set in the world of Pandora.");
        m4.setPosterUrl("https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400");
        movieRepository.save(m4);

        // Theaters
        Theater t1 = new Theater(); t1.setName("PVR Cinemas"); t1.setCity("Mumbai");
        t1.setLocation("Juhu"); t1.setAddress("Juhu Beach Road, Mumbai - 400049"); t1.setTotalSeats(120);
        theaterRepository.save(t1);

        Theater t2 = new Theater(); t2.setName("INOX Movies"); t2.setCity("Delhi");
        t2.setLocation("Connaught Place"); t2.setAddress("CP Inner Circle, New Delhi - 110001"); t2.setTotalSeats(100);
        theaterRepository.save(t2);

        Theater t3 = new Theater(); t3.setName("Cinepolis"); t3.setCity("Bangalore");
        t3.setLocation("Koramangala"); t3.setAddress("Forum Mall, Koramangala, Bengaluru - 560034"); t3.setTotalSeats(80);
        theaterRepository.save(t3);

        // Shows & Seats
        createShow(m1, t1, LocalDateTime.now().plusHours(2), 250.0, 40);
        createShow(m1, t1, LocalDateTime.now().plusHours(6), 250.0, 40);
        createShow(m2, t1, LocalDateTime.now().plusHours(3), 300.0, 40);
        createShow(m2, t2, LocalDateTime.now().plusHours(4), 280.0, 40);
        createShow(m3, t2, LocalDateTime.now().plusHours(5), 320.0, 40);
        createShow(m3, t3, LocalDateTime.now().plusHours(7), 260.0, 40);

        System.out.println("✅ Sample data loaded successfully!");
    }

    private void createShow(Movie movie, Theater theater, LocalDateTime showTime, double price, int rows) {
        Show show = new Show();
        show.setMovie(movie); show.setTheater(theater);
        show.setShowTime(showTime); show.setPrice(price);
        show.setTotalSeats(rows * 10); show.setAvailableSeats(rows * 10);
        show.setStatus(Show.ShowStatus.ACTIVE);
        showRepository.save(show);

        List<Seat> seats = new ArrayList<>();
        String[] rowLabels = {"A","B","C","D","E","F","G","H","I","J"};
        for (int r = 0; r < Math.min(rows, 10); r++) {
            for (int s = 1; s <= 10; s++) {
                Seat seat = new Seat();
                seat.setShow(show);
                seat.setRow(rowLabels[r]);
                seat.setSeatNumber(rowLabels[r] + s);
                seat.setSeatIndex(s);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                // Premium seats in first 2 rows
                if (r < 2) { seat.setSeatType(Seat.SeatType.PREMIUM); seat.setPrice(price * 1.5); }
                else if (r >= 8) { seat.setSeatType(Seat.SeatType.RECLINER); seat.setPrice(price * 2.0); }
                else { seat.setSeatType(Seat.SeatType.STANDARD); seat.setPrice(price); }
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
    }
}
