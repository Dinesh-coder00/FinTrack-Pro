package com.fintrack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendWelcomeEmail(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Welcome to FinTrack Pro");
        message.setText(
                "Hello " + name + ",\n\n" +
                "Welcome to FinTrack Pro!\n" +
                "Your account has been created successfully.\n\n" +
                "Thank you."
        );

        mailSender.send(message);
    }
    public void sendLoginAlertEmail(String to, String name) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Login Alert - FinTrack Pro");
        message.setText(
                "Hello " + name + ",\n\n" +
                "You have successfully logged in to your FinTrack Pro account.\n\n" +
                "If this was not you, please change your password immediately.\n\n" +
                "Thank you.");

        mailSender.send(message);
    }
    public void sendBudgetWarningEmail(String to, String name, double usedPercent) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Budget Warning - FinTrack Pro");
        message.setText(
                "Hello " + name + ",\n\n" +
                "Warning! You have used " + usedPercent + "% of your monthly budget.\n\n" +
                "Please control your expenses to stay within your budget.\n\n" +
                "Thank you.");

        mailSender.send(message);
    }
    public void sendBudgetExceededEmail(String to, String name, double pct) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Budget Exceeded - FinTrack Pro");
        message.setText(
                "Hello " + name + ",\n\n" +
                "Alert! You have exceeded your monthly budget.\n" +
                "Current usage: " + String.format("%.1f", pct) + "%\n\n" +
                "Please review your expenses immediately.\n\n" +
                "Thank you.");

        mailSender.send(message);
    }
    public void sendGoalCompletedEmail(
            String to,
            String name,
            String goalName
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Goal Achieved - FinTrack Pro");

        message.setText(
                "Hello " + name + ",\n\n" +
                "Congratulations! 🎉\n\n" +
                "You have successfully achieved your savings goal:\n" +
                goalName + "\n\n" +
                "Keep up the great financial habits.\n\n" +
                "Thank you."
        );

        mailSender.send(message);
    }
    public void sendOtpEmail(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Password Reset OTP - FinTrack Pro");
        message.setText(
                "Hello,\n\n" +
                "Your OTP for resetting your FinTrack Pro password is: " + otp + "\n\n" +
                "This OTP is valid for 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Thank you.");

        mailSender.send(message);
    }
}