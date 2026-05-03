package com.library.service;

import java.util.List;

/**
 * Modular email abstraction.
 * The underlying provider (JavaMailSender, SendGrid, etc.) can be swapped
 * by creating a new implementation of this interface.
 */
public interface EmailService {

    /**
     * Send an HTML email to a single recipient.
     *
     * @param to      recipient email address
     * @param subject email subject line
     * @param body    HTML email body
     */
    void sendEmail(String to, String subject, String body);

    /**
     * Send a single HTML email to multiple recipients via BCC.
     * Gmail caps at ~100 recipients per message — callers must
     * pre-split lists into chunks of ≤100.
     *
     * @param bccRecipients list of BCC email addresses (max 100)
     * @param subject       email subject line
     * @param body          HTML email body
     */
    void sendBccEmail(List<String> bccRecipients, String subject, String body);
}
