package com.mycompany.hospitalmanagementsystem;

import com.formdev.flatlaf.FlatClientProperties;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.plaf.basic.BasicButtonUI;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.JTableHeader;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.image.BufferedImage;
import java.net.URL;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.Random;

public class UIUtils {

    public static final Color COLOR_TEAL = new Color(0, 102, 102);
    public static final Color COLOR_BLUE = new Color(0, 123, 255);
    public static final Color COLOR_RED = new Color(220, 53, 69);
    public static final Color COLOR_ORANGE = new Color(255, 193, 7);
    public static final Color COLOR_DARK_BG = new Color(0, 0, 0, 200);
    
    // Modern Palette
    public static final Color COLOR_PRIMARY = new Color(0, 102, 102);    
    public static final Color COLOR_SECONDARY = new Color(30, 30, 30);   
    public static final Color COLOR_ACCENT = new Color(0, 123, 255);     
    public static final Color COLOR_BACKGROUND = new Color(240, 242, 245); 
    public static final Color COLOR_TEXT_HEADER = new Color(45, 45, 45);
    
    public static final Font FONT_HEADER = new Font("Segoe UI", Font.BOLD, 24);
    public static final Font FONT_GENERAL = new Font("Segoe UI", Font.PLAIN, 14);

    // --- NEW VALIDATION HELPERS ---

    // 1. Force Numeric Input Only (e.g., Phone, Age, Qty)
    public static void setNumericOnly(JTextField txt, int limit) {
        txt.addKeyListener(new KeyAdapter() {
            public void keyTyped(KeyEvent e) {
                char c = e.getKeyChar();
                // Allow digits and backspace/delete, block others
                if (!Character.isDigit(c) && c != KeyEvent.VK_BACK_SPACE) {
                    e.consume();
                }
                // Enforce Length Limit
                if (txt.getText().length() >= limit && c != KeyEvent.VK_BACK_SPACE && txt.getSelectedText() == null) {
                    e.consume();
                }
            }
        });
    }

    // 2. Force Alphabetic Input Only (e.g., Name)
    public static void setTextOnly(JTextField txt) {
        txt.addKeyListener(new KeyAdapter() {
            public void keyTyped(KeyEvent e) {
                char c = e.getKeyChar();
                // Allow letters, space, and backspace
                if (!Character.isLetter(c) && !Character.isSpaceChar(c) && c != KeyEvent.VK_BACK_SPACE) {
                    e.consume();
                }
            }
        });
    }

    // 3. Email Regex Check
    public static boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.compile(regex).matcher(email).matches();
    }

    

    public static JPanel createBackgroundPanel(String imageName) {
        return new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                try {
                    URL imgUrl = getClass().getResource("/images/" + imageName);
                    if (imgUrl != null) {
                        ImageIcon img = new ImageIcon(imgUrl);
                        g.drawImage(img.getImage(), 0, 0, getWidth(), getHeight(), this);
                    } else {
                        g.setColor(new Color(240, 248, 255));
                        g.fillRect(0, 0, getWidth(), getHeight());
                    }
                } catch (Exception e) { e.printStackTrace(); }
            }
        };
    }

    public static void styleButton(JButton btn, Color bgColor) {
        btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btn.setBackground(bgColor);             
        btn.setForeground(Color.WHITE);         
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(bgColor.darker(), 1),
                BorderFactory.createEmptyBorder(8, 15, 8, 15)
        ));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
    
    public static JPanel createCardPanel() {
        JPanel p = new JPanel();
        p.setBackground(Color.WHITE);
        p.setBorder(new EmptyBorder(20, 20, 20, 20));
        return p;
    }

    public static void styleTable(JTable table) {
        table.setRowHeight(30);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        table.getTableHeader().putClientProperty("FlatLaf.style", "hoverBackground: null; pressedBackground: null; separatorColor: #ffffff");
        JTableHeader header = table.getTableHeader();
        header.setDefaultRenderer(new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
                JLabel l = (JLabel) super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
                l.setBackground(COLOR_TEAL);
                l.setForeground(Color.WHITE);
                l.setFont(new Font("Segoe UI", Font.BOLD, 14));
                l.setHorizontalAlignment(JLabel.CENTER);
                l.setOpaque(true);
                l.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 1, Color.WHITE));
                return l;
            }
        });
        table.setSelectionBackground(new Color(173, 216, 230)); 
        table.setSelectionForeground(Color.BLACK);
        DefaultTableCellRenderer centerRenderer = new DefaultTableCellRenderer();
        centerRenderer.setHorizontalAlignment(JLabel.CENTER);
        for (int i = 0; i < table.getColumnCount(); i++)
            table.getColumnModel().getColumn(i).setCellRenderer(centerRenderer);
    }

    public static String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public static Object[] generateCaptchaImage() {
        int w = 190, h = 45; 
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, w, h);
        String chars = "ACDEFHJKLMNPRTUVWXY34679"; 
        StringBuilder code = new StringBuilder();
        Random r = new Random();
        g.setFont(new Font("Monospaced", Font.BOLD, 28)); 
        for (int i = 0; i < 5; i++) {
            char c = chars.charAt(r.nextInt(chars.length()));
            code.append(c);
            g.setColor(new Color(r.nextInt(100), r.nextInt(100), r.nextInt(100)));
            g.drawString(String.valueOf(c), 15 + (i * 32), 32); 
        }
        g.setStroke(new BasicStroke(1));
        for(int i = 0; i < 10; i++) {
            g.setColor(new Color(r.nextInt(150), r.nextInt(150), r.nextInt(150)));
            g.drawLine(r.nextInt(w), r.nextInt(h), r.nextInt(w), r.nextInt(h));
        }
        g.dispose();
        return new Object[]{code.toString(), new ImageIcon(img)};
    }
}