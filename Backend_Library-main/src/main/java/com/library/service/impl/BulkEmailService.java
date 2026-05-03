package com.library.service.impl;

import com.library.repository.AnalyticsRepository;
import com.library.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Asynchronous bulk email service for sending "We Miss You" retention
 * emails to inactive users.
 *
 * <h3>Gmail SMTP Constraints Handled</h3>
 * <ul>
 *   <li><b>BCC Limit:</b> Gmail caps at ~100 recipients per message.
 *       Users are split into BCC batches of {@value #BCC_BATCH_SIZE}.</li>
 *   <li><b>Rate Limit:</b> A {@value #THROTTLE_DELAY_MS}ms delay is added
 *       between each batch to prevent Google from flagging the account
 *       as a spam bot.</li>
 * </ul>
 *
 * The entire process runs on a dedicated async thread pool ("emailTaskExecutor")
 * so the main application is never blocked or slowed down.
 */
@Service
public class BulkEmailService {

    private static final Logger log = LoggerFactory.getLogger(BulkEmailService.class);

    /** Gmail allows ~100 recipients per email. We stay safely under the limit. */
    private static final int BCC_BATCH_SIZE = 90;

    /** Delay between BCC batches to avoid spam/bot rate limits (ms). */
    private static final long THROTTLE_DELAY_MS = 3000;

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Sends "We Miss You" emails to all inactive users asynchronously.
     * <ol>
     *   <li>Fetches inactive users from the analytics query</li>
     *   <li>Splits into BCC batches of ≤{@value #BCC_BATCH_SIZE}</li>
     *   <li>Sends each batch as a single BCC email</li>
     *   <li>Waits {@value #THROTTLE_DELAY_MS}ms between batches</li>
     * </ol>
     *
     * @param onComplete callback executed when all emails are sent (resets the controller guard)
     */
    @Async("emailTaskExecutor")
    public void sendInactiveUserEmails(Runnable onComplete) {
        log.info("Bulk 'We Miss You' email job started");

        try {
            List<Map<String, Object>> inactiveUsers = analyticsRepository.findInactiveUsers();

            if (inactiveUsers.isEmpty()) {
                log.info("No inactive users found — nothing to send");
                return;
            }

            // Extract all email addresses
            List<String> allEmails = new ArrayList<>();
            for (Map<String, Object> user : inactiveUsers) {
                String email = String.valueOf(user.get("email"));
                if (email != null && !email.isBlank() && !"null".equals(email)) {
                    allEmails.add(email);
                }
            }

            if (allEmails.isEmpty()) {
                log.warn("Inactive users found but none have valid email addresses");
                return;
            }

            // Split into BCC batches of ≤BCC_BATCH_SIZE
            List<List<String>> batches = partitionList(allEmails, BCC_BATCH_SIZE);

            log.info("Sending to {} users in {} BCC batch(es) of up to {}",
                    allEmails.size(), batches.size(), BCC_BATCH_SIZE);

            String subject = "📖 We miss you at ScanNexus Library!";
            // Generic body (no personalization since BCC goes to many recipients)
            String body = buildWeMissYouEmail();

            int successBatches = 0;
            int failedBatches = 0;

            for (int i = 0; i < batches.size(); i++) {
                List<String> batch = batches.get(i);

                try {
                    emailService.sendBccEmail(batch, subject, body);
                    successBatches++;
                    log.info("Batch {}/{} sent successfully ({} recipients)",
                            i + 1, batches.size(), batch.size());
                } catch (Exception e) {
                    failedBatches++;
                    log.error("Batch {}/{} FAILED ({} recipients): {}",
                            i + 1, batches.size(), batch.size(), e.getMessage());
                }

                // Throttle: wait between batches to avoid Gmail rate-limiting
                if (i + 1 < batches.size()) {
                    log.info("Throttling — waiting {}ms before next batch…", THROTTLE_DELAY_MS);
                    try {
                        Thread.sleep(THROTTLE_DELAY_MS);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("Throttle delay interrupted — stopping bulk email job");
                        break;
                    }
                }
            }

            log.info("Bulk email job completed: {}/{} batches sent, {} failed, {} total recipients",
                    successBatches, batches.size(), failedBatches, allEmails.size());

        } finally {
            if (onComplete != null) {
                onComplete.run();
            }
        }
    }

    /**
     * Splits a list into sublists of at most {@code batchSize} elements.
     */
    private <T> List<List<T>> partitionList(List<T> list, int batchSize) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += batchSize) {
            partitions.add(list.subList(i, Math.min(i + batchSize, list.size())));
        }
        return partitions;
    }

    /**
     * Generic "We Miss You" email (no personalization since BCC
     * sends the same body to all recipients in a batch).
     */
    private String buildWeMissYouEmail() {
        return """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 28px;">📖 Long Time No See!</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">ScanNexus Library misses you</p>
                </div>
                <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #f1f5f9; border-top: none;">
                    <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hey there 👋,</p>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                        It's been a while since we've seen you at the library! We've added some amazing new books
                        to our collection, and we think you'd love them.
                    </p>
                    <div style="background: #fff7ed; border-radius: 12px; padding: 20px 24px; margin: 0 0 20px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 24px;">🌟</p>
                        <p style="margin: 0 0 4px; color: #1e293b; font-size: 16px; font-weight: 700;">New arrivals are waiting for you!</p>
                        <p style="margin: 0; color: #78716c; font-size: 14px;">
                            Browse our latest collection and find your next great read.
                        </p>
                    </div>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                        Whether it's fiction, science, history, or something completely new — there's always
                        something exciting at ScanNexus. Come back and explore!
                    </p>
                    <p style="color: #475569; font-size: 14px; margin: 0;">
                        See you soon! 📚<br/>
                        <strong>The ScanNexus Library Team</strong>
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 20px 24px; border-radius: 0 0 12px 12px; border: 1px solid #f1f5f9; border-top: none; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">ScanNexus Library Management System</p>
                </div>
            </div>
            """;
    }
}
