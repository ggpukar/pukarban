package com.mycompany.hospitalmanagementsystem;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;
import java.awt.print.PrinterException;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;

public class PrescriptionDialog extends JDialog {
    
    String patientEmail = "";

    public PrescriptionDialog(JFrame p, String dName, String pid, String pName, String apptId) {
        super(p, "Write Prescription", true); 
        setSize(900, 700); 
        setLocationRelativeTo(p); 
        setLayout(new BorderLayout());
        
        // Fetch Email
        fetchPatientEmail(pid);

        // Header
        JPanel top = new JPanel(new GridLayout(3, 1, 5, 5));
        top.setBorder(BorderFactory.createEmptyBorder(15, 20, 10, 20));
        top.setBackground(new Color(240, 248, 255));
        
        JLabel l1 = new JLabel("HOSPITAL PRESCRIPTION"); 
        l1.setFont(new Font("Segoe UI", Font.BOLD, 24)); l1.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel l2 = new JLabel("Patient: " + pName + "  |  ID: " + pid);
        l2.setFont(new Font("Segoe UI", Font.BOLD, 16));
        
        JLabel l3 = new JLabel("Doctor: " + dName + "  |  Date: " + new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        l3.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        top.add(l1); top.add(l2); top.add(l3);
        add(top, BorderLayout.NORTH);
        
        // Input Areas
        JPanel c = new JPanel(new GridLayout(3,1, 10, 10));
        c.setBorder(BorderFactory.createEmptyBorder(10,20,10,20));
        
        JTextArea tD = new JTextArea("Diagnosis..."); tD.setBorder(BorderFactory.createTitledBorder("1. Diagnosis / Symptoms"));
        tD.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        JTextArea tM = new JTextArea("Rx:\n1. "); tM.setBorder(BorderFactory.createTitledBorder("2. Medicines (Name - Dosage - Duration)"));
        tM.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        JTextArea tA = new JTextArea("1. Drink plenty of water.\n2. Follow up in 7 days."); tA.setBorder(BorderFactory.createTitledBorder("3. Advice / Lab Tests"));
        tA.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        c.add(new JScrollPane(tD)); 
        c.add(new JScrollPane(tM)); 
        c.add(new JScrollPane(tA)); 
        add(c, BorderLayout.CENTER);
        
        // Buttons
        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 15));
        
        JButton btnPrint = new JButton("🖨 SAVE & PRINT");
        UIUtils.styleButton(btnPrint, new Color(0, 102, 102)); // Teal
        
        JButton btnEmail = new JButton("📧 SAVE & EMAIL");
        UIUtils.styleButton(btnEmail, new Color(0, 123, 255)); // Blue
        
        btnPanel.add(btnPrint);
        btnPanel.add(btnEmail);
        add(btnPanel, BorderLayout.SOUTH);
        
        // Logic
        ActionListener saveAction = e -> {
            boolean isEmail = (e.getSource() == btnEmail);
            
            if(isEmail && (patientEmail == null || patientEmail.isEmpty())) {
                JOptionPane.showMessageDialog(this, "This patient does not have an email registered.\nPlease use Print option.", "No Email Found", JOptionPane.WARNING_MESSAGE);
                return;
            }

            try {
                Connection con = DBConnection.connect();
                
                // 1. Save to DB
                PreparedStatement pst = con.prepareStatement("INSERT INTO prescriptions (patient_code, doctor_name, diagnosis, medicines, advice) VALUES (?,?,?,?,?)");
                pst.setLong(1, Long.parseLong(pid)); 
                pst.setString(2, dName);
                pst.setString(3, tD.getText()); 
                pst.setString(4, tM.getText()); 
                pst.setString(5, tA.getText());
                pst.executeUpdate();
                
                // 2. Update Appointment Status
                PreparedStatement pstUpdate = con.prepareStatement("UPDATE appointments SET status='Advised' WHERE id=?");
                pstUpdate.setInt(1, Integer.parseInt(apptId));
                pstUpdate.executeUpdate();
                
                con.close();

                // 3. Generate Slip String
                StringBuilder slip = new StringBuilder();
                slip.append("          HOSPITAL PRESCRIPTION          \n");
                slip.append("------------------------------------------\n");
                slip.append("Doctor: ").append(dName).append("\n");
                slip.append("Patient: ").append(pName).append(" (ID: ").append(pid).append(")\n");
                slip.append("Date: ").append(new Date()).append("\n");
                slip.append("------------------------------------------\n\n");
                slip.append("[ DIAGNOSIS ]\n").append(tD.getText()).append("\n\n");
                slip.append("[ MEDICINES ]\n").append(tM.getText()).append("\n\n");
                slip.append("[ ADVICE ]\n").append(tA.getText()).append("\n\n");
                slip.append("------------------------------------------\n");
                slip.append("Signature: ___________________________\n");

                // 4. Handle Action
                if(isEmail) {
                    new Thread(() -> Email.sendEmail(patientEmail, "Prescription from " + dName, slip.toString())).start();
                    JOptionPane.showMessageDialog(this, "✅ Saved & Email Sent!");
                } else {
                    JTextPane printPane = new JTextPane();
                    printPane.setText(slip.toString());
                    printPane.setFont(new Font("Monospaced", Font.PLAIN, 12));
                    try {
                        printPane.print(null, null, true, null, null, true);
                        JOptionPane.showMessageDialog(this, "✅ Saved & Sent to Printer!");
                    } catch (PrinterException ex) { ex.printStackTrace(); }
                }
                
                dispose();

            } catch(Exception ex) { ex.printStackTrace(); JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage()); }
        };

        btnPrint.addActionListener(saveAction);
        btnEmail.addActionListener(saveAction);
    }

    private void fetchPatientEmail(String pid) {
        try {
            Connection con = DBConnection.connect();
            PreparedStatement pst = con.prepareStatement("SELECT email FROM patients WHERE patient_code=?");
            pst.setString(1, pid);
            ResultSet rs = pst.executeQuery();
            if(rs.next()) {
                patientEmail = rs.getString("email");
            }
            con.close();
        } catch(Exception e) { e.printStackTrace(); }
    }
}