package com.library.service.impl;

import com.library.entity.IssuedBook;
import com.library.repository.IssuedBookRepository;
import com.library.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Daily cron job that sends due-date reminder emails to users
 * whose books are due tomorrow. Marks each record as reminded
 * after successful send (idempotent).
 */
@Service
public class EmailSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(EmailSchedulerService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    @Autowired
    private IssuedBookRepository issuedBookRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every day at 9:00 AM server time.
     * Fetches books due tomorrow that haven't been reminded yet,
     * sends personalized emails, and marks them as reminded.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void sendDueDateReminders() {
        log.info("Due-date reminder job started");

        List<IssuedBook> dueTomorrow = issuedBookRepository.findBooksDueTomorrow();

        if (dueTomorrow.isEmpty()) {
            log.info("No books due tomorrow — nothing to send");
            return;
        }

        log.info("Found {} book(s) due tomorrow, sending reminders…", dueTomorrow.size());

        int successCount = 0;
        int failCount = 0;

        for (int i = 0; i < dueTomorrow.size(); i++) {
            IssuedBook ib = dueTomorrow.get(i);
            try {
                String userName = ib.getUser().getUserName();
                String bookTitle = ib.getBook().getTitle();
                String dueDate = ib.getDueDate().format(DATE_FMT);
                String email = ib.getUser().getEmailId();

                String subject = "📚 Reminder: \"" + bookTitle + "\" is due tomorrow!";
                String body = buildReminderEmailBody(userName, bookTitle, dueDate);

                emailService.sendEmail(email, subject, body);

                // Mark as sent (idempotency)
                issuedBookRepository.markReminderSent(ib.getIssueId());
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("Failed to send reminder for issueId={}: {}",
                        ib.getIssueId(), e.getMessage());
            }

            // Throttle: 1-second delay between emails to avoid Gmail rate limits.
            // This runs on Spring's scheduler thread, NOT the main request thread,
            // so it will never cause app lag.
            if (i + 1 < dueTomorrow.size()) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Reminder throttle interrupted — stopping job");
                    break;
                }
            }
        }

        log.info("Due-date reminder job completed: {} sent, {} failed", successCount, failCount);
    }

    private String buildReminderEmailBody(String userName, String bookTitle, String dueDate) {
        return """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px;">📚 ScanNexus Library</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Book Return Reminder</p>
                </div>
                <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #f1f5f9; border-top: none;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hi <strong>%s</strong>,</p>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                        This is a friendly reminder that your borrowed book is due for return <strong>tomorrow</strong>.
                    </p>
                    <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 20px;">
                        <p style="margin: 0 0 4px; color: #9a3412; font-size: 13px; font-weight: 600; text-transform: uppercase;">Book Details</p>
                        <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 700;">%s</p>
                        <p style="margin: 4px 0 0; color: #78716c; font-size: 14px;">Due Date: <strong>%s</strong></p>
                    </div>
                    <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 8px;">
                        Please return the book on time to avoid any late fees. If you've already returned it, please disregard this email.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 20px 24px; border-radius: 0 0 12px 12px; border: 1px solid #f1f5f9; border-top: none; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">ScanNexus Library Management System</p>
                </div>
            </div>
            """.formatted(userName, bookTitle, dueDate);
    }
}
