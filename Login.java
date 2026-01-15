package com.mycompany.hospitalmanagementsystem;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import java.util.prefs.Preferences;

public class Login extends JFrame {

    JTextField userText, captchaInput;
    JPasswordField passText;
    JComboBox<String> roleCombo;
    JLabel lblCaptchaImg;
    String currentCaptchaCode;
    JCheckBox chkShowPass, chkNewUser, chkRemember;
    Preferences prefs = Preferences.userNodeForPackage(Login.class);
    Font font18 = new Font("Segoe UI", Font.BOLD, 18);

    public Login() {
        setTitle("Hospital Management System");
        setExtendedState(JFrame.MAXIMIZED_BOTH); 
        setDefaultCloseOperation(EXIT_ON_CLOSE);

//background 
        JPanel mainPanel = UIUtils.createBackgroundPanel("login_bg.jpg");
        mainPanel.setLayout(null);
        setContentPane(mainPanel);

       //card panel
        JPanel card = new JPanel(null) {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                // Semi-transparent white (170 alpha)
                g2.setColor(new Color(255, 255, 255, 170)); 
                g2.fillRect(0, 0, getWidth(), getHeight());
                g2.dispose();
            }
        };
        card.setOpaque(false); 
        card.setSize(550, 750); 
        card.setBorder(BorderFactory.createLineBorder(new Color(200, 200, 200), 2));
        mainPanel.add(card);

        addComponentListener(new ComponentAdapter() {
            public void componentShown(ComponentEvent e) { centerCard(card); }
            public void componentResized(ComponentEvent e) { centerCard(card); }
        });

        //HEADER 
        JLabel icon = new JLabel("", SwingConstants.CENTER);
        icon.setFont(new Font("Segoe UI", Font.PLAIN, 50));
        icon.setBounds(0, 20, 550, 60);
        card.add(icon);

        
        JLabel title = new JLabel("<html><center>Welcome to Hospital Management System<br>Please go through login to access</center></html>", SwingConstants.CENTER);
        title.setFont(new Font("Segoe UI", Font.BOLD, 20));
        title.setForeground(UIUtils.COLOR_TEAL);
        title.setBounds(0, 80, 550, 60); 
        card.add(title);

        int x = 50, y = 160, w = 450, h = 40; 

        // Roles
        JLabel lRole = new JLabel("Role:"); lRole.setFont(font18); lRole.setBounds(x, y, w, 25); card.add(lRole);
        roleCombo = new JComboBox<>(new String[]{"Admin", "Doctor", "Staff"});
        roleCombo.setFont(font18); roleCombo.setBounds(x, y += 30, w, h);
        card.add(roleCombo);

        //New User Login
        chkNewUser = new JCheckBox("First Time Login?");
        chkNewUser.setBounds(x, y += 50, 250, 30);
        chkNewUser.setOpaque(false);
        chkNewUser.setFont(font18);
        chkNewUser.setForeground(UIUtils.COLOR_BLUE);
        chkNewUser.setVisible(false);
        card.add(chkNewUser);

        // Username
        JLabel lUser = new JLabel("Username:"); lUser.setFont(font18); lUser.setBounds(x, y += 35, w, 25); card.add(lUser);
        userText = new JTextField(); userText.setFont(font18); userText.setBounds(x, y += 30, w, h);
        card.add(userText);

        // Password
        JLabel lPass = new JLabel("Password:"); lPass.setFont(font18); lPass.setBounds(x, y += 50, w, 25); card.add(lPass);
        passText = new JPasswordField(); passText.setFont(font18); passText.setBounds(x, y += 30, w, h);
        card.add(passText);

        // Options
        chkShowPass = new JCheckBox("Show"); chkShowPass.setBounds(x, y += 45, 80, 30);
        chkShowPass.setFont(new Font("Segoe UI", Font.BOLD, 14)); chkShowPass.setOpaque(false); card.add(chkShowPass);

        chkRemember = new JCheckBox("Remember Me"); chkRemember.setBounds(x + 100, y, 140, 30);
        chkRemember.setFont(new Font("Segoe UI", Font.BOLD, 14)); chkRemember.setOpaque(false); card.add(chkRemember);

        JLabel lblForgot = new JLabel("Forgot Password?");
        lblForgot.setBounds(x + 280, y, 170, 30);
        lblForgot.setFont(new Font("Segoe UI", Font.BOLD, 14));
        lblForgot.setForeground(UIUtils.COLOR_RED);
        lblForgot.setCursor(new Cursor(Cursor.HAND_CURSOR));
        card.add(lblForgot);
        lblForgot.addMouseListener(new MouseAdapter() { public void mouseClicked(MouseEvent e) { handleForgotPassword(); } });

        // Captcha
        lblCaptchaImg = new JLabel();
        lblCaptchaImg.setBounds(x, y += 40, 200, 45);
        lblCaptchaImg.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        lblCaptchaImg.setCursor(new Cursor(Cursor.HAND_CURSOR));
        lblCaptchaImg.setToolTipText("Click to Refresh");
        card.add(lblCaptchaImg);

        captchaInput = new JTextField(); captchaInput.setFont(font18);
        captchaInput.setBounds(x + 220, y, 230, 45);
        captchaInput.setToolTipText("Enter code here");
        card.add(captchaInput);

        refreshCaptcha();
        lblCaptchaImg.addMouseListener(new MouseAdapter() { public void mouseClicked(MouseEvent e) { refreshCaptcha(); } });

        // Buttons
        JButton btnLogin = new JButton("LOGIN ");
        btnLogin.setBounds(x, y += 70, 200, 50);
        UIUtils.styleButton(btnLogin, UIUtils.COLOR_TEAL);
        btnLogin.setFont(font18); 
        card.add(btnLogin);

        JButton btnReg = new JButton("Register New User");
        btnReg.setBounds(x + 220, y, 230, 50);
        UIUtils.styleButton(btnReg, Color.GRAY);
        btnReg.setFont(font18);
        card.add(btnReg);

        // Events
        roleCombo.addActionListener(e -> updateRoleState());
        chkNewUser.addActionListener(e -> updatePasswordState());
        chkShowPass.addActionListener(e -> passText.setEchoChar(chkShowPass.isSelected() ? (char) 0 : '•'));
        btnLogin.addActionListener(e -> handleLogin());
        btnReg.addActionListener(e -> showRegister());

        // Check Prefs
        if (!prefs.get("user", "").isEmpty()) {
            userText.setText(prefs.get("user", ""));
            passText.setText(prefs.get("pass", ""));
            roleCombo.setSelectedItem(prefs.get("role", "Admin"));
            chkRemember.setSelected(true);
        } else {
            userText.setText("");
            passText.setText("");
        }
        roleCombo.getActionListeners()[0].actionPerformed(null);
    }

    private void centerCard(JPanel card) { card.setLocation((getWidth() - card.getWidth()) / 2, (getHeight() - card.getHeight()) / 2); }

    private void updateRoleState() {
        boolean isAdmin = roleCombo.getSelectedItem().equals("Admin");
        lblCaptchaImg.setVisible(!isAdmin); captchaInput.setVisible(!isAdmin); chkNewUser.setVisible(!isAdmin);
        if (isAdmin) { passText.setEnabled(true); passText.setBackground(Color.WHITE); passText.setText(""); } else updatePasswordState();
    }

    private void updatePasswordState() {
        if (chkNewUser.isSelected()) { passText.setEnabled(true); passText.setBackground(Color.WHITE); passText.setText(""); } 
        else { passText.setEnabled(false); passText.setBackground(new Color(230, 230, 230)); passText.setText("Password Not Required"); }
    }

    private void refreshCaptcha() {
        Object[] c = UIUtils.generateCaptchaImage();
        currentCaptchaCode = (String) c[0];
        lblCaptchaImg.setIcon((ImageIcon) c[1]);
        System.out.println("DEBUG: Captcha Code: " + currentCaptchaCode);
    }

    // --- HANDLE LOGIN ---
    private void handleLogin() {
        String u = userText.getText().trim();
        String p = new String(passText.getPassword()).trim();
        String role = roleCombo.getSelectedItem().toString().toLowerCase();
        boolean isNewUser = chkNewUser.isSelected();

        if (!role.equals("admin")) {
            String entered = captchaInput.getText().trim();
            if (!entered.equalsIgnoreCase(currentCaptchaCode)) {
                JOptionPane.showMessageDialog(this, "Wrong Captcha Code!", "Security Error", JOptionPane.ERROR_MESSAGE);
                refreshCaptcha(); captchaInput.setText(""); return;
            }
        }

        try {
            Connection con = DBConnection.connect();
            
            // --- FIX: STOP CRASH IF DB IS OFFLINE ---
            if (con == null) {
                JOptionPane.showMessageDialog(this, "Database Connection Failed!\nCheck if MySQL is running or libs are missing.", "Fatal Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            
            PreparedStatement pst;
            if (role.equals("admin") || isNewUser) {
                if (p.isEmpty()) { JOptionPane.showMessageDialog(this, "Enter Password"); con.close(); return; }
                pst = con.prepareStatement("SELECT * FROM users WHERE username=? AND password=? AND role=?");
                pst.setString(1, u); pst.setString(2, p); pst.setString(3, role);
            } else {
                pst = con.prepareStatement("SELECT * FROM users WHERE username=? AND role=?");
                pst.setString(1, u); pst.setString(2, role);
            }
            ResultSet rs = pst.executeQuery();

            if (rs.next()) {
                if (!rs.getBoolean("is_active")) { JOptionPane.showMessageDialog(this, "⛔ Account Disabled."); con.close(); return; }
                
                if (!role.equals("admin") && !isNewUser && rs.getBoolean("requires_password")) {
                    JOptionPane.showMessageDialog(this, "Security Alert: New User.\nCheck 'First Time Login' and enter password.", "Alert", JOptionPane.WARNING_MESSAGE);
                    con.close(); return;
                }
                
                if (isNewUser && !role.equals("admin")) {
                    con.createStatement().executeUpdate("UPDATE users SET requires_password=FALSE WHERE id=" + rs.getInt("id"));
                }
                
                if (chkRemember.isSelected()) {
                    prefs.put("user", u); if(role.equals("admin")) prefs.put("pass", p); prefs.put("role", roleCombo.getSelectedItem().toString());
                } else { prefs.remove("user"); prefs.remove("pass"); prefs.remove("role"); }

                int uid = rs.getInt("id");
                String fullName = rs.getString("name"); 
                
                // --- AUTO CLEAR FIELDS AFTER LOGIN ---
                userText.setText("");
                passText.setText("");
                captchaInput.setText("");
                chkNewUser.setSelected(false);
                
                dispose();
                if (role.equals("admin")) new AdminDashboard().setVisible(true);
                else if (role.equals("doctor")) new DoctorDashboard(uid, fullName).setVisible(true);
                else new StaffDashboard(uid, fullName).setVisible(true);
            } else {
                JOptionPane.showMessageDialog(this, "Invalid Credentials", "Failed", JOptionPane.ERROR_MESSAGE); refreshCaptcha();
            }
            con.close();
        } catch (Exception ex) { ex.printStackTrace(); }
    }

    private void handleForgotPassword() {
        String username = JOptionPane.showInputDialog(this, "Enter your Username:");
        if (username != null && !username.trim().isEmpty()) {
            try {
                Connection con = DBConnection.connect();
                if(con == null) return;
                PreparedStatement pst = con.prepareStatement("SELECT email, name FROM users WHERE username=?");
                pst.setString(1, username);
                ResultSet rs = pst.executeQuery();
                if (rs.next()) {
                    String email = rs.getString("email");
                    String name = rs.getString("name");
                    String newPass = UIUtils.generatePassword();
                    con.createStatement().executeUpdate("UPDATE users SET password='" + newPass + "', requires_password=TRUE WHERE username='" + username + "'");
                    new Thread(() -> Email.sendPasswordEmail(email, name, username, newPass)).start();
                    JOptionPane.showMessageDialog(this, "Password reset successfully!\nCheck email: " + email);
                } else { JOptionPane.showMessageDialog(this, "Username not found.", "Error", JOptionPane.ERROR_MESSAGE); }
                con.close();
            } catch (Exception e) { e.printStackTrace(); }
        }
    }

    // ================= REGISTER NEW USER =================
    private void showRegister() {
        JDialog d = new JDialog(this, "Register New User", true);
        d.setSize(600, 800);
        JPanel p = new JPanel(new GridBagLayout());
        p.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        d.add(p);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10); gbc.fill = GridBagConstraints.HORIZONTAL; gbc.weightx = 1.0;

        JTextField tName = new JTextField(); tName.setFont(font18);
        JTextArea tAddr = new JTextArea(3, 20); tAddr.setFont(font18); tAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        
        JPanel pPhone = new JPanel(new BorderLayout(5,0));
        JLabel lPre = new JLabel("977"); lPre.setFont(font18);
        JTextField tPhone = new JTextField(); tPhone.setFont(font18);
        pPhone.add(lPre, BorderLayout.WEST); pPhone.add(tPhone, BorderLayout.CENTER);
        
        JPanel pEmail = new JPanel(new BorderLayout());
        JTextField tEmailUser = new JTextField(); tEmailUser.setFont(font18);
        JLabel lDomain = new JLabel("@gmail.com"); lDomain.setFont(font18);
        pEmail.add(tEmailUser, BorderLayout.CENTER); pEmail.add(lDomain, BorderLayout.EAST);

        JComboBox<String> cRole = new JComboBox<>(new String[]{"Staff", "Doctor"}); cRole.setFont(font18);
        JTextField tNMC = new JTextField(); tNMC.setFont(font18);
        String[] departments = { "Primary Care & General Services", "Outpatient Department (OPD)", "Inpatient Department (IPD)", "Emergency / Casualty", "Family Medicine", "Internal Medicine", "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Geriatrics", "Hematology", "Infectious Diseases", "Nephrology", "Neurology", "Oncology", "Pulmonology", "Rheumatology", "Anesthesiology", "General Surgery", "Obstetrics and Gynecology (OB-GYN)", "Ophthalmology", "Orthopedics", "ENT", "Urology", "Operation Theatre (OT)", "Pathology", "Radiology", "Pharmacy", "Physiotherapy", "Dietary", "Psychiatry", "ICU", "NICU", "PICU", "CCU" };
        JComboBox<String> cDept = new JComboBox<>(departments); cDept.setFont(new Font("Segoe UI", Font.PLAIN, 14));

        JLabel lNMC = new JLabel("NMC Number:"); lNMC.setFont(font18);
        JLabel lDept = new JLabel("Department:"); lDept.setFont(font18);

        int row = 0;
        addFormRow(p, gbc, "Select Role:", cRole, row++);
        addFormRow(p, gbc, "Full Name:", tName, row++);
        addFormRow(p, gbc, "Address:", new JScrollPane(tAddr), row++);
        addFormRow(p, gbc, "Phone (10 digits):", pPhone, row++);
        addFormRow(p, gbc, "Email User:", pEmail, row++);

        gbc.gridx = 0; gbc.gridy = row; p.add(lNMC, gbc); gbc.gridx = 1; p.add(tNMC, gbc); lNMC.setVisible(false); tNMC.setVisible(false); row++;
        gbc.gridx = 0; gbc.gridy = row; p.add(lDept, gbc); gbc.gridx = 1; p.add(cDept, gbc); lDept.setVisible(false); cDept.setVisible(false); row++;

        // --- BUTTONS PANEL ---
        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        JButton btnReg = new JButton("REGISTER"); UIUtils.styleButton(btnReg, UIUtils.COLOR_BLUE); btnReg.setFont(font18);
        JButton btnClear = new JButton("CLEAR"); UIUtils.styleButton(btnClear, Color.GRAY); btnClear.setFont(font18);
        btnPanel.add(btnReg); btnPanel.add(btnClear);

        gbc.gridx = 0; gbc.gridy = row; gbc.gridwidth = 2; gbc.insets = new Insets(20, 10, 10, 10);
        p.add(btnPanel, gbc);

        // --- LOGIC ---
        cRole.addActionListener(e -> {
            boolean isDoc = cRole.getSelectedItem().equals("Doctor");
            lNMC.setVisible(isDoc); tNMC.setVisible(isDoc); lDept.setVisible(isDoc); cDept.setVisible(isDoc);
            d.pack();
        });

        // --- CLEAR FORM LOGIC ---
        btnClear.addActionListener(e -> {
            tName.setText(""); tAddr.setText(""); tPhone.setText(""); tEmailUser.setText(""); tNMC.setText(""); 
            cRole.setSelectedIndex(0); cDept.setSelectedIndex(0);
            
            // Explicitly hide doc fields
            lNMC.setVisible(false); tNMC.setVisible(false); lDept.setVisible(false); cDept.setVisible(false);
            d.pack();
        });

        btnReg.addActionListener(e -> {
            if(tName.getText().isEmpty() || tAddr.getText().isEmpty() || tEmailUser.getText().isEmpty()) { JOptionPane.showMessageDialog(d, "Fill all basic fields!"); return; }
            if(tPhone.getText().length() != 10) { JOptionPane.showMessageDialog(d, "Phone must be 10 digits (without 977)!"); return; }
            if(cRole.getSelectedItem().equals("Doctor")) {
                String nmc = tNMC.getText().trim();
                if(nmc.isEmpty() || nmc.length() > 10) { JOptionPane.showMessageDialog(d, "NMC Number must be 1-10 digits!"); return; }
            }

            try {
                Connection con = DBConnection.connect();
                String pass = UIUtils.generatePassword();
                String fullEmail = tEmailUser.getText().trim() + "@gmail.com";
                String fullPhone = "977" + tPhone.getText().trim();
                String role = cRole.getSelectedItem().toString().toLowerCase();

                String sql = "INSERT INTO users (name, address, phone, email, username, password, role, is_active, requires_password, nmc_number, department) VALUES (?,?,?,?,?,?,?,TRUE,TRUE,?,?)";
                PreparedStatement pst = con.prepareStatement(sql);
                pst.setString(1, tName.getText()); 
                pst.setString(2, tAddr.getText()); 
                pst.setString(3, fullPhone);
                pst.setString(4, fullEmail); 
                pst.setString(5, tEmailUser.getText()); 
                pst.setString(6, pass); 
                pst.setString(7, role);
                
                if(role.equals("doctor")) { pst.setString(8, tNMC.getText()); pst.setString(9, cDept.getSelectedItem().toString()); } 
                else { pst.setNull(8, Types.VARCHAR); pst.setNull(9, Types.VARCHAR); }

                pst.executeUpdate();
                JOptionPane.showMessageDialog(d, "Success! Password sent to " + fullEmail);
                new Thread(() -> Email.sendPasswordEmail(fullEmail, tName.getText(), tEmailUser.getText(), pass)).start();
                d.dispose(); con.close();
            } catch (Exception ex) { JOptionPane.showMessageDialog(d, "Error: " + ex.getMessage()); }
        });

        d.pack(); d.setLocationRelativeTo(null); d.setVisible(true);
    }

    private void addFormRow(JPanel p, GridBagConstraints gbc, String label, Component comp, int y) {
        gbc.gridx = 0; gbc.gridy = y; gbc.gridwidth = 1;
        JLabel l = new JLabel(label); l.setFont(font18);
        p.add(l, gbc);
        gbc.gridx = 1; p.add(comp, gbc);
    }

    public static void main(String[] args) {
        try { 
            // FLATLAF THEME SETUP
            com.formdev.flatlaf.FlatIntelliJLaf.setup();
        } catch (Exception e) { e.printStackTrace(); }

        java.awt.EventQueue.invokeLater(() -> {
            new Login().setVisible(true);
        });
    }
}