package com.library.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Fallback mail configuration — activated ONLY when {@code spring.mail.host}
 * is NOT set in application.properties.
 *
 * When the property IS present, Spring Boot's auto-configuration creates
 * the real {@link JavaMailSender} bean and this class is skipped entirely.
 *
 * To enable real email sending, add these to application.properties:
 * <pre>
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=your-email@gmail.com
 *   spring.mail.password=your-app-password
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 * </pre>
 */
@Configuration
@ConditionalOnProperty(name = "spring.mail.host", havingValue = "NOT_SET", matchIfMissing = true)
public class MailConfig {

    private static final Logger log = LoggerFactory.getLogger(MailConfig.class);

    @Bean
    public JavaMailSender javaMailSender() {
        log.warn("╔══════════════════════════════════════════════════════════════╗");
        log.warn("║  No spring.mail.host configured — using fallback mailSender ║");
        log.warn("║  Emails will FAIL at send time. Configure SMTP properties   ║");
        log.warn("║  in application.properties to enable real email delivery.    ║");
        log.warn("╚══════════════════════════════════════════════════════════════╝");
        return new JavaMailSenderImpl();
    }
}
