package com.library.service.impl;

import com.library.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * SMTP-based implementation of {@link EmailService} using Spring's JavaMailSender.
 * Replace this bean with a SendGrid or other provider implementation if needed.
 */
@Service
public class SmtpEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@library.com}")
    private String fromAddress;

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    @Override
    public void sendBccEmail(List<String> bccRecipients, String subject, String body) {
        if (bccRecipients == null || bccRecipients.isEmpty()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // 'To' is our own address; real recipients are in BCC
            // so no individual address is leaked to others
            helper.setTo(fromAddress);
            helper.setBcc(bccRecipients.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
            log.info("BCC email sent successfully to {} recipients", bccRecipients.size());
        } catch (MessagingException e) {
            log.error("Failed to send BCC email to {} recipients: {}",
                    bccRecipients.size(), e.getMessage(), e);
            throw new RuntimeException("Failed to send BCC email", e);
        }
    }
}
