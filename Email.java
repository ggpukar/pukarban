package com.mycompany.hospitalmanagementsystem;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;

public class Email {
    // 1. Update your new email here
    private static final String SENDER_EMAIL = "hospitalmanagementsystem327@gmail.com"; 
    
    // 2. Paste the 16-character App Password here (keep the spaces or remove them, both work)
    private static final String SENDER_PASSWORD = "kvkzszntgkzzliil"; 

    public static void sendPasswordEmail(String recipient, String name, String username, String password) {
        String subject = "HMS Login Credentials";
        String body = "Welcome " + name + ",\n\nUsername: " + username + "\nPassword: " + password + "\n\nLog in as a 'New User' first.";
        sendEmail(recipient, subject, body);
    }

    public static void sendEmail(String recipient, String subject, String body) {
        if(recipient == null || recipient.isEmpty()) return;
        
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true"); 
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com"); 
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        
        Session session = Session.getInstance(props, new Authenticator() {
            @Override protected PasswordAuthentication getPasswordAuthentication() { 
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD); 
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
            message.setSubject(subject);
            message.setText(body);
            Transport.send(message);
            System.out.println("Email sent successfully to " + recipient);
        } catch (AddressException e) {
            System.err.println("❌ FAILED: Invalid Email Address format: " + recipient);
        } catch (MessagingException e) { 
            e.printStackTrace(); 
        }
    }
}