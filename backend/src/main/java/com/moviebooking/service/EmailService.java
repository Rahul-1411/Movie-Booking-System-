package com.moviebooking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendBookingEmail(
            String to,
            String userName,
            String bookingId,
            String movie,
            String theatre,
            String showTime,
            String seats,
            Double amount
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("🎬 Movie Booking Confirmed");

            String html = """
                <html>
                <body style="font-family:Arial;background:#f5f5f5;padding:20px;">
                <div style="max-width:600px;margin:auto;background:white;
                     padding:20px;border-radius:10px;">

                <h2 style="color:green;">🎉 Booking Confirmed!</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your booking has been confirmed successfully.</p>

                <table cellpadding="8">
                    <tr><td><b>Booking ID</b></td><td>%s</td></tr>
                    <tr><td><b>Movie</b></td><td>%s</td></tr>
                    <tr><td><b>Theatre</b></td><td>%s</td></tr>
                    <tr><td><b>Show Time</b></td><td>%s</td></tr>
                    <tr><td><b>Seats</b></td><td>%s</td></tr>
                    <tr><td><b>Total Amount</b></td><td>₹ %.2f</td></tr>
                </table>

                <br>
                <p>Enjoy your movie! 🍿</p>
                <hr>
                <p style="color:gray;">Thank you for booking with us.</p>
                </div>
                </body>
                </html>
                """.formatted(
                    userName, bookingId, movie,
                    theatre, showTime, seats, amount
            );

            helper.setText(html, true);
            mailSender.send(message);
            log.info("✅ Email sent to {}", to);

        } catch (MessagingException e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}