# 🎬 CineBook — Movie Booking System

A full-stack movie ticket booking system built with Spring Boot (backend) and React + Vite (frontend), featuring:

✅ Optimistic Locking to handle concurrent seat booking conflicts

✅ MySQL persistent database

✅ JWT Authentication delivered via secure HttpOnly cookies, with role-based access (USER / ADMIN)

✅ Instant booking confirmation — no external payment gateway, seats are booked in a single atomic step

✅ Real-time seat layout with seat type support (Standard / Premium / Recliner)

✅ Automated HTML booking confirmation emails sent immediately after successful booking, containing movie, theater, show time, seats, amount, and booking reference details

✅ Admin Dashboard to manage movies, shows, and theaters

---

## 🏗️ Project Structure

```
movie-booking-system/
├── backend/                    # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/moviebooking/
│       ├── config/             # Security, DataInitializer
│       ├── controller/         # REST API controllers
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities (with @Version for optimistic lock)
│       ├── exception/          # Custom exceptions + global handler
│       ├── repository/         # Spring Data JPA repositories
│       ├── security/           # JWT filter, UserDetailsService
│       └── service/            # Business logic
└── frontend/                   # React + Vite + Tailwind
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── context/            # AuthContext (global auth state)
        ├── pages/              # Home, MovieDetail, SeatSelection, etc.
        ├── components/         # Navbar, MovieCard, SeatMap, Spinner
        └── services/           # Axios API service
```

---

## ⚙️ Prerequisites

| Tool       | Version  |
|------------|----------|
| Java       | 17+      |
| Maven      | 3.8+     |
| MySQL      | 8.0+     |
| Node.js    | 18+      |
| npm        | 9+       |

---

## 🚀 Getting Started

### 1. Create the MySQL database

**Option B — Local MySQL install:**
```sql
CREATE DATABASE moviedb;
```

The app will auto-create tables on startup (`spring.jpa.hibernate.ddl-auto=update`), so you only need the empty schema to exist.

> The connection string also has `createDatabaseIfNotExist=true`, so MySQL will create it for you automatically if it doesn't already exist — as long as your user has `CREATE` privileges.

### 2. Configure database credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moviedb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

Change `username` / `password` to match your local MySQL setup.

### 3. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8081**

On first run, sample movies/theaters/shows/users are seeded automatically. On subsequent restarts, the seeder detects existing data and skips re-seeding (so your bookings persist).

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**

## 🔐 Concurrent Booking — Optimistic Locking Explained

The `Seat` entity uses JPA's `@Version` annotation:

```java
@Entity
public class Seat {
    @Version
    private Long version;  // Auto-incremented on every update
}
```

**What happens when two users try to book the same seat simultaneously:**

1. User A and User B both fetch seat with `version = 0`
2. User A's request is processed first → seat saved with `version = 1` and `status = BOOKED` ✅
3. User B's request then tries to save the same seat → Hibernate detects the `version` mismatch → throws `ObjectOptimisticLockingFailureException` ❌
4. The global exception handler catches this and returns HTTP 409 Conflict:
   ```json
   { "message": "One or more seats were just booked by another user. Please refresh and try again." }
   ```

No database-level row locks needed — this approach is fast and scales well under load.

---

## 🎟️ Booking Flow

```
User selects seats
       ↓
POST /api/bookings
  → Validates seats are AVAILABLE
  → Locks seats via optimistic version check (status → BOOKED)
  → If a conflict occurs (seat taken concurrently) → 409 Conflict
  → Otherwise → Booking is created with status CONFIRMED
       ↓
Booking confirmation page shown immediately
```

There is no external payment step — bookings are confirmed the moment seats are successfully reserved. This keeps the focus on the concurrency-safety mechanics; a payment gateway can be reintroduced later as a separate step between seat-locking and confirmation if needed.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Auth | Description                          |
|--------|------------------------|------|---------------------------------------|
| POST   | `/api/auth/register`   | ❌  | Register new user                      |
| POST   | `/api/auth/login`      | ❌  | Login, sets JWT as HttpOnly cookie     |
| POST   | `/api/auth/logout`     | ❌  | Clears the auth cookie                 |
| GET    | `/api/auth/me`         | 🔒  | Returns current logged-in user info    |

**Register Request:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123",
  "fullName": "Alice Smith",
  "phone": "9876543210"
}
```

**Login Response:**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "role": "ROLE_USER"
}
```
(The JWT itself is set as an HttpOnly cookie, not returned in the body.)

---

### Movies

| Method | Endpoint            | Auth        | Description                      |
|--------|----------------------|-------------|-----------------------------------|
| GET    | `/api/movies`         | ❌         | Get all movies                    |
| GET    | `/api/movies?status=NOW_SHOWING` | ❌ | Filter by status           |
| GET    | `/api/movies?search=inception`   | ❌ | Search by title            |
| GET    | `/api/movies/{id}`    | ❌         | Get movie by ID                   |
| POST   | `/api/movies`         | 🔒 ADMIN  | Create new movie                  |
| PUT    | `/api/movies/{id}`    | 🔒 ADMIN  | Update movie                      |
| DELETE | `/api/movies/{id}`    | 🔒 ADMIN  | Delete movie                      |

**Movie Status values:** `NOW_SHOWING` | `COMING_SOON` | `ENDED`

**Create Movie Request:**
```json
{
  "title": "Oppenheimer",
  "description": "The story of J. Robert Oppenheimer.",
  "genre": "Drama",
  "language": "English",
  "duration": 180,
  "director": "Christopher Nolan",
  "cast": "Cillian Murphy, Emily Blunt",
  "releaseDate": "2023-07-21",
  "posterUrl": "https://example.com/poster.jpg",
  "rating": 8.9,
  "status": "NOW_SHOWING"
}
```

---

### Theaters

| Method | Endpoint              | Auth       | Description              |
|--------|------------------------|------------|---------------------------|
| GET    | `/api/theaters`         | ❌        | Get all theaters          |
| GET    | `/api/theaters?city=Mumbai` | ❌   | Filter by city            |
| POST   | `/api/theaters`         | 🔒 ADMIN | Create theater            |

**Create Theater Request:**
```json
{
  "name": "INOX Megaplex",
  "city": "Mumbai",
  "location": "BKC",
  "address": "Bandra Kurla Complex, Mumbai - 400051",
  "totalSeats": 200
}
```

---

### Shows

| Method | Endpoint                     | Auth       | Description               |
|--------|-------------------------------|------------|----------------------------|
| GET    | `/api/shows`                   | ❌        | Get all active shows       |
| GET    | `/api/shows/movie/{movieId}`   | ❌        | Get shows for a movie      |
| GET    | `/api/shows/{showId}/seats`    | ❌        | Get seat layout for show   |
| POST   | `/api/shows`                   | 🔒 ADMIN | Create show + generate seats |

**Create Show Request:**
```json
{
  "movieId": 1,
  "theaterId": 2,
  "showTime": "2025-01-15T18:30:00",
  "price": 250.0,
  "totalSeats": 100
}
```

**Seat Layout Response:**
```json
{
  "showId": 1,
  "movieTitle": "Inception",
  "theaterName": "PVR Cinemas",
  "showTime": "2025-01-15T18:30:00",
  "availableSeats": 97,
  "totalSeats": 100,
  "seats": [
    {
      "id": 1,
      "seatNumber": "A1",
      "row": "A",
      "seatIndex": 1,
      "status": "AVAILABLE",
      "seatType": "PREMIUM",
      "price": 375.0,
      "version": 0
    }
  ]
}
```

**Seat Status values:** `AVAILABLE` | `BOOKED`  
**Seat Type values:** `STANDARD` | `PREMIUM` | `RECLINER`

---

### Bookings

| Method | Endpoint                        | Auth      | Description                                  |
|--------|-----------------------------------|-----------|------------------------------------------------|
| POST   | `/api/bookings`                   | 🔒 USER  | Create and confirm a booking in one step       |
| GET    | `/api/bookings/my`                | 🔒 USER  | Get current user's bookings                    |
| GET    | `/api/bookings/reference/{ref}`   | 🔒 USER  | Get booking by reference                       |
| DELETE | `/api/bookings/{id}/cancel`       | 🔒 USER  | Cancel a confirmed booking, releases seats      |

**Create Booking Request:**
```json
{
  "showId": 1,
  "seatIds": [5, 6, 7]
}
```

**Booking Response:**
```json
{
  "bookingId": 42,
  "bookingReference": "BKAB12CD34",
  "movieTitle": "Inception",
  "theaterName": "PVR Cinemas",
  "showTime": "2025-01-15T18:30:00",
  "seats": ["C5", "C6", "C7"],
  "totalAmount": 750.0,
  "status": "CONFIRMED",
  "createdAt": "2025-01-15T10:15:00"
}
```

**Booking Status values:** `CONFIRMED` | `CANCELLED`

**409 Conflict response (concurrent booking attempt):**
```json
{
  "message": "Seats were just taken by another user. Please select different seats.",
  "status": 409
}
```

---

## 🔑 Authentication

The JWT is delivered as an `HttpOnly` cookie named `jwt` on login — the browser sends it automatically with every request to the API (`withCredentials: true` is set on the frontend's Axios instance). There's no `Authorization` header to manage manually.

---

## 🌐 Frontend Pages

| Route                    | Access     | Description                  |
|---------------------------|------------|-------------------------------|
| `/`                       | Public     | Home — movie grid + filters  |
| `/login`                  | Public     | Login form                   |
| `/register`               | Public     | Registration form            |
| `/movies/:id`             | Public     | Movie detail + show times    |
| `/shows/:showId/seats`    | 🔒 USER  | Seat selection + instant booking |
| `/booking-success/:ref`   | 🔒 USER  | Booking confirmation ticket  |
| `/my-bookings`            | 🔒 USER  | User's booking history       |
| `/admin`                  | 🔒 ADMIN | Admin dashboard              |

---

## 🔧 Configuration Reference

| Property                        | Default                                  | Description                    |
|----------------------------------|------------------------------------------|----------------------------------|
| `server.port`                    | 8081                                     | Backend port                    |
| `spring.datasource.url`          | `jdbc:mysql://localhost:3306/moviedb...` | MySQL connection string         |
| `spring.datasource.username`     | root                                     | MySQL username                  |
| `spring.datasource.password`     | root                                     | MySQL password                  |
| `spring.jpa.hibernate.ddl-auto`  | update                                   | Auto schema management (dev)    |
| `app.jwt.secret`                 | (long random string)                     | JWT signing secret              |
| `app.jwt.expiration`             | 86400000 (24h)                           | JWT expiry in ms                |
| `app.cookie.secure`              | false                                    | Set `true` in production (HTTPS)|
| `app.cors.allowed-origins`       | http://localhost:3000                    | Allowed CORS origins            |

---

## 🗄️ Database Schema

```
users ──< bookings >── shows ──< seats
                  ↑              ↑
               movies         theaters
booking_seats (junction): bookings ↔ seats
```

---





