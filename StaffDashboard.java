package com.mycompany.hospitalmanagementsystem;

import javax.swing.*;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;
import java.awt.*;
import java.awt.datatransfer.*;
import java.awt.event.*;
import java.awt.print.PrinterException;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

public class StaffDashboard extends JFrame {
    int staffId;
    String staffUser;
    Font font18 = new Font("Segoe UI", Font.BOLD, 18);

    // Fields
    JCheckBox chkHasEmail;
    JTextField txtRegEmailUser, tId, tName, tPhone, tNat, tAge;
    JTextArea tAddr; 
    JComboBox<String> cSex;
    JTable patientTable; DefaultTableModel patientModel;

    JTextField txtApptPid, txtApptName, txtApptAge, txtApptSex, txtApptDate, txtApptEmail;
    JTextArea txtApptAddr; 
    JComboBox<String> cmbApptDept, cmbApptDoctor;
    JTable apptTable; DefaultTableModel apptModel;

    JTextField txtWardPid, txtWardName, txtWardAge, txtWardSex, txtWardPhone, txtWardBed;
    JTextArea txtWardAddr, txtWardDisease;
    JTable wardTable; DefaultTableModel wardModel;

    JTextField txtBillInvoice, txtBillPid, txtBillName, txtBillItem, txtBillQty, txtBillRate, txtBillDiscount, txtBillGrandTotal, txtBillEmail, txtBillPhone;
    JTextArea txtBillAddr;
    JTable billTable; DefaultTableModel billModel;
    double subTotal = 0.0;

    public StaffDashboard(int id, String username) {
        this.staffId = id;
        this.staffUser = username;
        setTitle("Staff Dashboard - " + username);
        setSize(1366, 768);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        
        JPanel mainPanel = UIUtils.createBackgroundPanel("staff_bg.jpg");
        mainPanel.setLayout(new BorderLayout());
        setContentPane(mainPanel);

        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(UIUtils.COLOR_DARK_BG);
        header.setPreferredSize(new Dimension(1200, 70));
        header.setBorder(BorderFactory.createEmptyBorder(0, 30, 0, 30));
        
        JLabel lblTitle = new JLabel(" STAFF PORTAL: " + username);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 24)); lblTitle.setForeground(Color.WHITE);
        JButton btnLogout = new JButton("Logout ➜");
        UIUtils.styleButton(btnLogout, UIUtils.COLOR_RED);
        btnLogout.addActionListener(e -> { dispose(); new Login().setVisible(true); });
        
        header.add(lblTitle, BorderLayout.WEST); header.add(btnLogout, BorderLayout.EAST);
        mainPanel.add(header, BorderLayout.NORTH);

        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(new Font("Segoe UI", Font.BOLD, 14));
        tabs.addTab(" Register Patient", createRegistrationPanel());
        tabs.addTab(" Appointments", createAppointmentPanel());
        tabs.addTab(" Ward / Admit", createWardPanel());
        tabs.addTab(" Billing & Invoice", createBillingPanel());
        mainPanel.add(tabs, BorderLayout.CENTER);
    }

    // 1. REGISTRATION PANEL
    private JPanel createRegistrationPanel() {
        JPanel p = new JPanel(new BorderLayout(10, 10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        JPanel form = new JPanel(new GridBagLayout()); form.setBackground(new Color(255,255,255,245));
        form.setBorder(BorderFactory.createTitledBorder("New Patient Entry"));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8); gbc.fill = GridBagConstraints.HORIZONTAL;

        tId = new JTextField(generateID()); tId.setEditable(false); tId.setBackground(new Color(230,230,230)); 
        tName=new JTextField(15); 
        tAddr=new JTextArea(3, 15); tAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY)); tAddr.setLineWrap(true);
        tPhone=new JTextField(10); 
        tNat=new JTextField(15); tAge=new JTextField(5);
        cSex = new JComboBox<>(new String[]{"Male", "Female", "Other"});
        
        // --- VALIDATION APPLIED HERE ---
        UIUtils.setTextOnly(tName);       // Only letters for Name
        UIUtils.setNumericOnly(tPhone, 10); // Only numbers, max 10 digits
        UIUtils.setNumericOnly(tAge, 3);    // Only numbers, max 3 digits
        // -------------------------------

        chkHasEmail = new JCheckBox("Has Email?"); chkHasEmail.setFont(font18); chkHasEmail.setOpaque(false);
        JPanel pEmail = new JPanel(new BorderLayout()); pEmail.setOpaque(false);
        txtRegEmailUser = new JTextField(15); txtRegEmailUser.setEnabled(false); txtRegEmailUser.setBackground(new Color(230,230,230));
        pEmail.add(txtRegEmailUser, BorderLayout.CENTER); pEmail.add(new JLabel("@gmail.com"), BorderLayout.EAST);

        chkHasEmail.addActionListener(e -> {
            boolean has = chkHasEmail.isSelected();
            txtRegEmailUser.setEnabled(has);
            txtRegEmailUser.setBackground(has ? Color.WHITE : new Color(230,230,230));
            if(!has) txtRegEmailUser.setText("");
        });
        
        Component[] fields = {tId, tName, tAddr, tPhone, tNat, tAge, cSex, txtRegEmailUser};
        for(Component c : fields) c.setFont(font18);

        addLabel(form, "Patient Code:", 0, 0, gbc); gbc.gridx=1; form.add(tId, gbc);
        JButton btnNew = new JButton("New Code"); UIUtils.styleButton(btnNew, UIUtils.COLOR_BLUE); btnNew.setPreferredSize(new Dimension(100, 30)); gbc.gridx=2; form.add(btnNew, gbc);

        addLabel(form, "Full Name:", 0, 1, gbc); gbc.gridx=1; gbc.gridwidth=2; form.add(tName, gbc); gbc.gridwidth=1;
        
        addLabel(form, "Phone:", 3, 1, gbc); 
        JPanel pPhone = new JPanel(new BorderLayout(5,0)); pPhone.setOpaque(false); 
        JLabel lPre = new JLabel("977-"); lPre.setFont(font18);
        pPhone.add(lPre, BorderLayout.WEST); pPhone.add(tPhone, BorderLayout.CENTER);
        gbc.gridx=4; form.add(pPhone, gbc);

        addLabel(form, "Address:", 0, 2, gbc); gbc.gridx=1; gbc.gridwidth=2; form.add(new JScrollPane(tAddr), gbc); gbc.gridwidth=1;
        addLabel(form, "National ID:", 3, 2, gbc); gbc.gridx=4; form.add(tNat, gbc);

        addLabel(form, "Age:", 0, 3, gbc); gbc.gridx=1; form.add(tAge, gbc);
        addLabel(form, "Sex:", 2, 3, gbc); gbc.gridx=3; form.add(cSex, gbc);
        
        gbc.gridx=0; gbc.gridy=4; form.add(chkHasEmail, gbc);
        gbc.gridx=1; gbc.gridwidth=2; form.add(pEmail, gbc); gbc.gridwidth=1;

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.CENTER)); btnPanel.setOpaque(false);
        JButton btnSave = new JButton(" SAVE NEW"); UIUtils.styleButton(btnSave, new Color(40, 167, 69)); 
        JButton btnUpdate = new JButton(" UPDATE"); UIUtils.styleButton(btnUpdate, UIUtils.COLOR_ORANGE); btnUpdate.setForeground(Color.BLACK);
        JButton btnClear = new JButton(" CLEAR"); UIUtils.styleButton(btnClear, Color.GRAY);
        btnPanel.add(btnSave); btnPanel.add(btnUpdate); btnPanel.add(btnClear);
        gbc.gridx=0; gbc.gridy=5; gbc.gridwidth=5; form.add(btnPanel, gbc);

        p.add(form, BorderLayout.NORTH);

        JPanel tablePanel = new JPanel(new BorderLayout()); tablePanel.setBorder(BorderFactory.createTitledBorder("Recent Patients"));
        patientModel = new DefaultTableModel(new String[]{"Patient Code", "Name", "Phone", "Age", "Sex", "Nat ID", "Address", "Email"}, 0);
        patientTable = new JTable(patientModel); UIUtils.styleTable(patientTable);
        tablePanel.add(new JScrollPane(patientTable), BorderLayout.CENTER);
        JPanel tableActs = new JPanel();
        JButton btnEditSel = new JButton("Load Selected"); UIUtils.styleButton(btnEditSel, UIUtils.COLOR_BLUE);
        JButton btnDelSel = new JButton("Delete Selected"); UIUtils.styleButton(btnDelSel, UIUtils.COLOR_RED);
        tableActs.add(btnEditSel); tableActs.add(btnDelSel);
        tablePanel.add(tableActs, BorderLayout.SOUTH);
        p.add(tablePanel, BorderLayout.CENTER);

        loadPatientTable();

        btnNew.addActionListener(e -> tId.setText(generateID()));
        btnClear.addActionListener(e -> {
            tId.setText(generateID()); tName.setText(""); tAddr.setText(""); tPhone.setText(""); tNat.setText(""); tAge.setText(""); 
            cSex.setSelectedIndex(0); chkHasEmail.setSelected(false); txtRegEmailUser.setText(""); txtRegEmailUser.setEnabled(false);
        });

        btnSave.addActionListener(e -> {
            if(tName.getText().trim().isEmpty() || tPhone.getText().trim().isEmpty() || tAge.getText().trim().isEmpty()) {
                JOptionPane.showMessageDialog(this, "Please fill Name, Phone, and Age."); return;
            }
            if(tPhone.getText().length() != 10) { JOptionPane.showMessageDialog(this, "Phone must be 10 digits"); return; }
            
            try { Connection con = DBConnection.connect();
                String fullPhone = "977" + tPhone.getText();
                String fullEmail = txtRegEmailUser.getText().isEmpty() ? "" : txtRegEmailUser.getText() + "@gmail.com";
                PreparedStatement pst = con.prepareStatement("INSERT INTO patients (patient_code, name, address, phone, national_id, age, sex, email) VALUES (?,?,?,?,?,?,?,?)");
                pst.setLong(1, Long.parseLong(tId.getText())); pst.setString(2, tName.getText()); pst.setString(3, tAddr.getText());
                pst.setString(4, fullPhone); pst.setString(5, tNat.getText()); pst.setInt(6, Integer.parseInt(tAge.getText())); 
                pst.setString(7, cSex.getSelectedItem().toString()); pst.setString(8, fullEmail);
                pst.executeUpdate(); 
                Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(tId.getText()), null);
                JOptionPane.showMessageDialog(this, "✅ Saved! ID Copied."); loadPatientTable(); con.close(); btnClear.doClick();
            } catch(Exception ex){ JOptionPane.showMessageDialog(this, "Error (Check Code): " + ex.getMessage()); }
        });

        // ... Edit/Update/Delete listeners ...
        btnEditSel.addActionListener(e -> {
            int r = patientTable.getSelectedRow();
            if(r != -1) {
                tId.setText(patientTable.getValueAt(r, 0).toString());
                tName.setText(patientTable.getValueAt(r, 1).toString());
                tPhone.setText(patientTable.getValueAt(r, 2).toString().replace("977", ""));
                tAge.setText(patientTable.getValueAt(r, 3).toString());
                cSex.setSelectedItem(patientTable.getValueAt(r, 4).toString());
                tNat.setText(patientTable.getValueAt(r, 5).toString());
                tAddr.setText(patientTable.getValueAt(r, 6).toString());
                String em = (patientTable.getValueAt(r, 7)!=null)?patientTable.getValueAt(r, 7).toString():"";
                if(em.contains("@")) { txtRegEmailUser.setText(em.split("@")[0]); chkHasEmail.setSelected(true); txtRegEmailUser.setEnabled(true); } 
                else { txtRegEmailUser.setText(""); chkHasEmail.setSelected(false); txtRegEmailUser.setEnabled(false); }
            }
        });

        btnUpdate.addActionListener(e -> {
            try { Connection con = DBConnection.connect();
                String fullPhone = "977" + tPhone.getText();
                String fullEmail = txtRegEmailUser.getText().isEmpty() ? "" : txtRegEmailUser.getText() + "@gmail.com";
                PreparedStatement pst = con.prepareStatement("UPDATE patients SET name=?, address=?, phone=?, national_id=?, age=?, sex=?, email=? WHERE patient_code=?");
                pst.setString(1, tName.getText()); pst.setString(2, tAddr.getText()); pst.setString(3, fullPhone);
                pst.setString(4, tNat.getText()); pst.setInt(5, Integer.parseInt(tAge.getText())); pst.setString(6, cSex.getSelectedItem().toString());
                pst.setString(7, fullEmail); pst.setLong(8, Long.parseLong(tId.getText()));
                pst.executeUpdate(); loadPatientTable(); con.close(); JOptionPane.showMessageDialog(this, "Updated!");
            } catch(Exception ex){ JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage()); }
        });

        btnDelSel.addActionListener(e -> {
            int r = patientTable.getSelectedRow();
            if(r != -1 && JOptionPane.showConfirmDialog(this, "Delete?") == 0) {
                try { Connection con = DBConnection.connect(); con.createStatement().executeUpdate("DELETE FROM patients WHERE patient_code=" + patientTable.getValueAt(r, 0)); loadPatientTable(); con.close(); } catch(Exception ex) {}
            }
        });

        return p;
    }

    private void loadPatientTable() {
        patientModel.setRowCount(0);
        try { Connection con = DBConnection.connect(); ResultSet rs = con.createStatement().executeQuery("SELECT * FROM patients ORDER BY patient_code DESC LIMIT 50");
            while(rs.next()) patientModel.addRow(new Object[]{rs.getString("patient_code"), rs.getString("name"), rs.getString("phone"), rs.getString("age"), rs.getString("sex"), rs.getString("national_id"), rs.getString("address"), rs.getString("email")});
            con.close();
        } catch(Exception e) {}
    }

    // 2. APPOINTMENTS PANEL
    private JPanel createAppointmentPanel() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        JPanel form = new JPanel(new GridBagLayout()); form.setBackground(new Color(255,255,255,245)); 
        form.setBorder(BorderFactory.createTitledBorder("Book / Manage Appointment"));
        GridBagConstraints gbc = new GridBagConstraints(); gbc.insets = new Insets(8, 8, 8, 8); gbc.fill = GridBagConstraints.HORIZONTAL; gbc.weightx = 1.0;

        txtApptPid = new JTextField(); txtApptName = new JTextField(); txtApptName.setEditable(false);
        txtApptAge = new JTextField(); txtApptAge.setEditable(false); txtApptSex = new JTextField(); txtApptSex.setEditable(false);
        txtApptAddr = new JTextArea(3, 10); txtApptAddr.setEditable(false); txtApptAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        txtApptEmail = new JTextField(); 
        txtApptDate = new JTextField(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        
        // --- VALIDATION ---
        UIUtils.setNumericOnly(txtApptPid, 6); // Patient code is 6 digits
        // ------------------

        String[] depts = { "Select Department", "Primary Care", "OPD", "Emergency", "Cardiology", "Dermatology", "Neurology", "General Surgery", "Orthopedics", "ENT", "Radiology", "Pharmacy", "ICU" };
        cmbApptDept = new JComboBox<>(depts); cmbApptDoctor = new JComboBox<>(); 

        addLabel(form, "Patient Code:", 0, 0, gbc); gbc.gridx=1; form.add(txtApptPid, gbc);
        JButton btnFind = new JButton(" FIND"); UIUtils.styleButton(btnFind, UIUtils.COLOR_BLUE); gbc.gridx=2; form.add(btnFind, gbc);

        addLabel(form, "Name:", 0, 1, gbc); gbc.gridx=1; form.add(txtApptName, gbc);
        addLabel(form, "Age/Sex:", 2, 1, gbc); 
        JPanel pAS = new JPanel(new GridLayout(1,2,5,0)); pAS.setOpaque(false); pAS.add(txtApptAge); pAS.add(txtApptSex);
        gbc.gridx=3; form.add(pAS, gbc);

        addLabel(form, "Address:", 0, 2, gbc); gbc.gridx=1; gbc.gridwidth=3; form.add(new JScrollPane(txtApptAddr), gbc); gbc.gridwidth=1;
        addLabel(form, "Department:", 0, 3, gbc); gbc.gridx=1; form.add(cmbApptDept, gbc);
        addLabel(form, "Doctor:", 2, 3, gbc); gbc.gridx=3; form.add(cmbApptDoctor, gbc);
        addLabel(form, "Date:", 0, 4, gbc); gbc.gridx=1; form.add(txtApptDate, gbc);
        addLabel(form, "Email (Slip):", 2, 4, gbc); gbc.gridx=3; form.add(txtApptEmail, gbc);

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0)); btnPanel.setOpaque(false);
        JButton btnEmail = new JButton(" Book & Email"); UIUtils.styleButton(btnEmail, new Color(23, 162, 184));
        JButton btnPrint = new JButton(" Book & Print"); UIUtils.styleButton(btnPrint, new Color(40, 167, 69));
        JButton btnClear = new JButton(" CLEAR"); UIUtils.styleButton(btnClear, Color.GRAY);
        btnPanel.add(btnEmail); btnPanel.add(btnPrint); btnPanel.add(btnClear);

        gbc.gridx=0; gbc.gridy=5; gbc.gridwidth=4; gbc.insets = new Insets(10,10,10,10); form.add(btnPanel, gbc);
        p.add(form, BorderLayout.NORTH);

        apptModel = new DefaultTableModel(new String[]{"ID", "PID", "Patient Name", "Doctor", "Date", "Status"}, 0);
        apptTable = new JTable(apptModel); UIUtils.styleTable(apptTable);
        JPanel tablePanel = new JPanel(new BorderLayout()); tablePanel.setBorder(BorderFactory.createTitledBorder("Appointments (Sorted by Date)"));
        addSearch(tablePanel, apptTable, apptModel);
        tablePanel.add(new JScrollPane(apptTable), BorderLayout.CENTER);
        JPanel tableActs = new JPanel(); tableActs.setOpaque(false);
        JButton btnUpdAppt = new JButton("Reschedule Selected"); UIUtils.styleButton(btnUpdAppt, UIUtils.COLOR_ORANGE); btnUpdAppt.setForeground(Color.BLACK);
        JButton btnDelAppt = new JButton("Cancel Selected"); UIUtils.styleButton(btnDelAppt, UIUtils.COLOR_RED);
        tableActs.add(btnUpdAppt); tableActs.add(btnDelAppt);
        tablePanel.add(tableActs, BorderLayout.SOUTH);
        p.add(tablePanel, BorderLayout.CENTER);

        // Logic
        btnFind.addActionListener(e -> {
            try { Connection con = DBConnection.connect(); PreparedStatement pst = con.prepareStatement("SELECT * FROM patients WHERE patient_code=?");
                pst.setString(1, txtApptPid.getText()); ResultSet rs = pst.executeQuery();
                if(rs.next()) {
                    txtApptName.setText(rs.getString("name")); txtApptAge.setText(rs.getString("age"));
                    txtApptSex.setText(rs.getString("sex")); txtApptAddr.setText(rs.getString("address"));
                    txtApptEmail.setText(rs.getString("email"));
                } else JOptionPane.showMessageDialog(this, "Not Found"); con.close();
            } catch(Exception ex) { ex.printStackTrace(); }
        });

        btnClear.addActionListener(e -> { txtApptPid.setText(""); txtApptName.setText(""); txtApptAge.setText(""); txtApptSex.setText(""); txtApptAddr.setText(""); txtApptEmail.setText(""); cmbApptDept.setSelectedIndex(0); });

        cmbApptDept.addActionListener(e -> {
            cmbApptDoctor.removeAllItems();
            String dept = cmbApptDept.getSelectedItem().toString();
            if(!dept.equals("Select Department")) {
                try { Connection con = DBConnection.connect(); 
                    PreparedStatement pst = con.prepareStatement("SELECT name FROM users WHERE role='doctor' AND department=?");
                    pst.setString(1, dept); ResultSet rs = pst.executeQuery();
                    while(rs.next()) cmbApptDoctor.addItem(rs.getString("name"));
                    con.close();
                } catch(Exception ex) {}
            }
        });

        ActionListener bookAction = e -> { if(!txtApptName.getText().isEmpty()) { handleBooking(e.getSource() == btnEmail); loadApptTable(); }};
        btnEmail.addActionListener(bookAction); btnPrint.addActionListener(bookAction);

        btnUpdAppt.addActionListener(e -> {
            int r = apptTable.getSelectedRow();
            if(r != -1) {
                String id = apptTable.getValueAt(r, 0).toString();
                String date = JOptionPane.showInputDialog(this, "Enter New Date (YYYY-MM-DD):", apptTable.getValueAt(r, 4));
                if(date != null && !date.isEmpty()) {
                    try { Connection con = DBConnection.connect(); con.createStatement().executeUpdate("UPDATE appointments SET appt_date='" + date + "' WHERE id=" + id);
                        loadApptTable(); con.close(); JOptionPane.showMessageDialog(this, "Rescheduled!");
                    } catch(Exception ex) {}
                }
            }
        });

        btnDelAppt.addActionListener(e -> {
            int r = apptTable.getSelectedRow();
            if(r != -1 && JOptionPane.showConfirmDialog(this, "Cancel this appointment?") == JOptionPane.YES_OPTION) {
                try { Connection con = DBConnection.connect(); con.createStatement().executeUpdate("DELETE FROM appointments WHERE id=" + apptTable.getValueAt(r, 0)); loadApptTable(); con.close(); } catch(Exception ex) {}
            }
        });

        loadApptTable();
        return p;
    }
private void handleBooking(boolean isEmail) {
        // --- 1. Validation Check (Prevents Crash) ---
        if (cmbApptDoctor.getSelectedItem() == null || cmbApptDept.getSelectedItem() == null) {
            JOptionPane.showMessageDialog(this, "Please select a Department and a Doctor first!");
            return;
        }

        try {
            Connection con = DBConnection.connect();
            PreparedStatement pst = con.prepareStatement("INSERT INTO appointments (patient_code, patient_name, doctor_name, appt_date) VALUES (?, ?, ?, ?)");
            pst.setLong(1, Long.parseLong(txtApptPid.getText())); 
            pst.setString(2, txtApptName.getText());
            pst.setString(3, cmbApptDoctor.getSelectedItem().toString()); 
            pst.setString(4, txtApptDate.getText());
            pst.executeUpdate(); 
            con.close();

            // --- 2. Updated Slip with Department ---
            StringBuilder slip = new StringBuilder();
            slip.append("      APPOINTMENT SLIP      \n");
            slip.append("----------------------------\n");
            slip.append("Your booking has been confirmed!\n\n");
            slip.append("PATIENT ID : ").append(txtApptPid.getText()).append("\n");
            slip.append("NAME       : ").append(txtApptName.getText()).append("\n");
            slip.append("DEPARTMENT : ").append(cmbApptDept.getSelectedItem().toString()).append("\n"); // Added Department
            slip.append("DOCTOR     : ").append(cmbApptDoctor.getSelectedItem().toString()).append("\n");
            slip.append("DATE       : ").append(txtApptDate.getText()).append("\n");
            slip.append("----------------------------\n");

            if(isEmail) {
                if(txtApptEmail.getText().isEmpty()) {
                    JOptionPane.showMessageDialog(this, "Enter Email Address!");
                } else {
                    new Thread(() -> Email.sendEmail(
                        txtApptEmail.getText(), 
                        "Appointment Confirmation", 
                        slip.toString()
                    )).start();
                    JOptionPane.showMessageDialog(this, "Success! Email Sent.");
                }
            } else { 
                JTextPane tp = new JTextPane(); 
                tp.setText(slip.toString()); 
                tp.setFont(new Font("Monospaced", Font.BOLD, 12)); 
                tp.print(); 
                JOptionPane.showMessageDialog(this, "Success! Sent to Printer.");
            }
            
        } catch(Exception ex) { 
            ex.printStackTrace(); 
            JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage());
        }
    }
    private void loadApptTable() {
        apptModel.setRowCount(0);
        try { Connection con = DBConnection.connect(); ResultSet rs = con.createStatement().executeQuery("SELECT * FROM appointments ORDER BY appt_date DESC, id DESC");
            while(rs.next()) apptModel.addRow(new Object[]{rs.getInt("id"), rs.getString("patient_code"), rs.getString("patient_name"), rs.getString("doctor_name"), rs.getString("appt_date"), rs.getString("status")});
            con.close();
        } catch(Exception e) {}
    }

    // 3. WARD PANEL
    private JPanel createWardPanel() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        JPanel form = new JPanel(new GridBagLayout()); form.setBackground(new Color(255,255,255,240)); form.setBorder(BorderFactory.createTitledBorder("Admission Desk"));
        GridBagConstraints gbc = new GridBagConstraints(); gbc.insets = new Insets(8,8,8,8); gbc.fill = GridBagConstraints.HORIZONTAL;

        txtWardPid = new JTextField(10); txtWardName = new JTextField(15); txtWardName.setEditable(false);
        txtWardAge = new JTextField(5); txtWardAge.setEditable(false); txtWardSex = new JTextField(8); txtWardSex.setEditable(false);
        txtWardPhone = new JTextField(15); txtWardPhone.setEditable(false);
        txtWardAddr = new JTextArea(2, 15); txtWardAddr.setEditable(false); txtWardAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        txtWardBed = new JTextField(10); 
        txtWardDisease = new JTextArea(3, 15); txtWardDisease.setBorder(BorderFactory.createLineBorder(Color.GRAY));

        // --- VALIDATION ---
        UIUtils.setNumericOnly(txtWardPid, 6);
        // ------------------

        addLabel(form, "Patient Code:", 0, 0, gbc); gbc.gridx=1; form.add(txtWardPid, gbc);
        JButton btnFind = new JButton(" Find Patient"); UIUtils.styleButton(btnFind, UIUtils.COLOR_BLUE); gbc.gridx=2; form.add(btnFind, gbc);

        addLabel(form, "Name:", 0, 1, gbc); gbc.gridx=1; form.add(txtWardName, gbc);
        addLabel(form, "Age/Sex:", 2, 1, gbc); 
        JPanel pas = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0)); pas.setOpaque(false); pas.add(txtWardAge); pas.add(new JLabel(" / ")); pas.add(txtWardSex);
        gbc.gridx=3; form.add(pas, gbc);

        addLabel(form, "Address:", 0, 2, gbc); gbc.gridx=1; gbc.gridwidth=2; form.add(new JScrollPane(txtWardAddr), gbc); gbc.gridwidth=1;
        addLabel(form, "Phone:", 3, 2, gbc); gbc.gridx=4; form.add(txtWardPhone, gbc);

        addLabel(form, "Assign Bed:", 0, 3, gbc); gbc.gridx=1; form.add(txtWardBed, gbc);
        
        addLabel(form, "Disease/Reason:", 0, 4, gbc); gbc.gridx=1; gbc.gridwidth=3; form.add(new JScrollPane(txtWardDisease), gbc); gbc.gridwidth=1;

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0)); btnPanel.setOpaque(false);
        JButton btnAdmit = new JButton("ADMIT PATIENT"); UIUtils.styleButton(btnAdmit, UIUtils.COLOR_ORANGE); btnAdmit.setForeground(Color.BLACK);
        JButton btnClear = new JButton(" CLEAR"); UIUtils.styleButton(btnClear, Color.GRAY);
        btnPanel.add(btnAdmit); btnPanel.add(btnClear);
        gbc.gridx=1; gbc.gridy=5; gbc.gridwidth=2; form.add(btnPanel, gbc);

        p.add(form, BorderLayout.NORTH);

        wardModel = new DefaultTableModel(new String[]{"ID", "PID", "Name", "Bed", "Disease", "Admit Date", "Status"}, 0);
        wardTable = new JTable(wardModel); UIUtils.styleTable(wardTable);
        JPanel tablePanel = new JPanel(new BorderLayout());
        addSearch(tablePanel, wardTable, wardModel);
        tablePanel.add(new JScrollPane(wardTable), BorderLayout.CENTER);
        JPanel tableActs = new JPanel(); tableActs.setOpaque(false);
        JButton btnDischarge = new JButton(" Discharge"); UIUtils.styleButton(btnDischarge, new Color(40, 167, 69));
        JButton btnEditWard = new JButton(" Edit Details"); UIUtils.styleButton(btnEditWard, UIUtils.COLOR_BLUE);
        JButton btnDelWard = new JButton(" Delete Record"); UIUtils.styleButton(btnDelWard, UIUtils.COLOR_RED);
        tableActs.add(btnDischarge); tableActs.add(btnEditWard); tableActs.add(btnDelWard);
        tablePanel.add(tableActs, BorderLayout.SOUTH);
        p.add(tablePanel, BorderLayout.CENTER);

        loadWardTable();

        btnFind.addActionListener(e -> {
            try { Connection con = DBConnection.connect(); PreparedStatement pst = con.prepareStatement("SELECT * FROM patients WHERE patient_code=?");
            pst.setString(1, txtWardPid.getText()); ResultSet rs = pst.executeQuery();
            if(rs.next()) {
                txtWardName.setText(rs.getString("name"));
                txtWardAge.setText(rs.getString("age")); txtWardSex.setText(rs.getString("sex"));
                txtWardPhone.setText(rs.getString("phone")); txtWardAddr.setText(rs.getString("address"));
            } else JOptionPane.showMessageDialog(this, "Not Found"); con.close(); } catch(Exception ex){}
        });

        btnClear.addActionListener(e -> {
            txtWardPid.setText(""); txtWardName.setText(""); txtWardAge.setText(""); txtWardSex.setText("");
            txtWardPhone.setText(""); txtWardAddr.setText(""); txtWardBed.setText(""); txtWardDisease.setText("");
        });

        btnAdmit.addActionListener(e -> {
            if(txtWardName.getText().isEmpty()) return;
            try { Connection con = DBConnection.connect();
                PreparedStatement check = con.prepareStatement("SELECT * FROM admissions WHERE bed_no=? AND status='Admitted'");
                check.setString(1, txtWardBed.getText());
                if(check.executeQuery().next()) { JOptionPane.showMessageDialog(this, "Bed Occupied!"); con.close(); return; }

                PreparedStatement pst = con.prepareStatement("INSERT INTO admissions (patient_code, patient_name, bed_no, disease, status) VALUES (?,?,?,?, 'Admitted')");
                pst.setLong(1, Long.parseLong(txtWardPid.getText())); pst.setString(2, txtWardName.getText());
                pst.setString(3, txtWardBed.getText()); pst.setString(4, txtWardDisease.getText());
                pst.executeUpdate(); loadWardTable(); con.close(); JOptionPane.showMessageDialog(this, "Admitted!"); btnClear.doClick();
            } catch(Exception ex){ JOptionPane.showMessageDialog(this, "Error: "+ex.getMessage()); }
        });

        btnDischarge.addActionListener(e -> {
            int r = wardTable.getSelectedRow();
            if(r != -1) {
                if(wardTable.getValueAt(r, 6).toString().equalsIgnoreCase("Discharged")) { JOptionPane.showMessageDialog(this, "Already Discharged"); return; }
                try { Connection con = DBConnection.connect();
                    con.createStatement().executeUpdate("UPDATE admissions SET status='Discharged', discharge_date=CURDATE() WHERE id=" + wardTable.getValueAt(r, 0));
                    loadWardTable(); con.close(); JOptionPane.showMessageDialog(this, "Patient Discharged");
                } catch(Exception ex) {}
            }
        });

        btnEditWard.addActionListener(e -> {
            int r = wardTable.getSelectedRow();
            if(r != -1) {
                String id = wardTable.getValueAt(r, 0).toString();
                String bed = JOptionPane.showInputDialog(this, "Edit Bed No:", wardTable.getValueAt(r, 3));
                String dis = JOptionPane.showInputDialog(this, "Edit Disease:", wardTable.getValueAt(r, 4));
                if(bed != null && dis != null) {
                    try { Connection con = DBConnection.connect();
                        PreparedStatement pst = con.prepareStatement("UPDATE admissions SET bed_no=?, disease=? WHERE id=?");
                        pst.setString(1, bed); pst.setString(2, dis); pst.setString(3, id);
                        pst.executeUpdate(); loadWardTable(); con.close();
                    } catch(Exception ex) {}
                }
            }
        });
        
        btnDelWard.addActionListener(e -> {
            int r = wardTable.getSelectedRow();
            if(r != -1 && JOptionPane.showConfirmDialog(this, "Delete record?") == JOptionPane.YES_OPTION) {
                try { Connection con = DBConnection.connect(); con.createStatement().executeUpdate("DELETE FROM admissions WHERE id=" + wardTable.getValueAt(r, 0)); loadWardTable(); con.close(); } catch(Exception ex) {}
            }
        });

        return p;
    }

    private void loadWardTable() {
        wardModel.setRowCount(0);
        try { Connection con = DBConnection.connect(); ResultSet rs = con.createStatement().executeQuery("SELECT * FROM admissions ORDER BY id DESC");
            while(rs.next()) wardModel.addRow(new Object[]{ rs.getInt("id"), rs.getString("patient_code"), rs.getString("patient_name"), rs.getString("bed_no"), rs.getString("disease"), rs.getString("admit_date"), rs.getString("status") });
            con.close();
        } catch(Exception e) {}
    }

    // 4. BILLING PANEL
    private JPanel createBillingPanel() {
        JPanel p = new JPanel(null); p.setOpaque(false);
        JPanel top = new JPanel(new GridLayout(3, 4, 10, 5)); 
        top.setBounds(50, 20, 1100, 100); top.setBackground(new Color(255,255,255,240)); top.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));

        txtBillInvoice = new JTextField(); txtBillInvoice.setEditable(false); txtBillInvoice.setFont(new Font("Segoe UI", Font.BOLD, 14));
        txtBillPid = new JTextField(); txtBillName = new JTextField(); txtBillName.setEditable(false);
        txtBillEmail = new JTextField(); 
        txtBillPhone = new JTextField(); txtBillPhone.setEditable(false);
        txtBillAddr = new JTextArea(2, 10); txtBillAddr.setEditable(false); txtBillAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        
        // --- VALIDATION ---
        UIUtils.setNumericOnly(txtBillPid, 6);
        // ------------------

        top.add(new JLabel("Invoice No (PK):")); top.add(txtBillInvoice);
        JPanel pidP = new JPanel(new BorderLayout()); pidP.setOpaque(false);
        JButton btnF = new JButton("Find"); UIUtils.styleButton(btnF, UIUtils.COLOR_BLUE); btnF.setPreferredSize(new Dimension(60, 25));
        pidP.add(txtBillPid, BorderLayout.CENTER); pidP.add(btnF, BorderLayout.EAST);
        top.add(new JLabel("Patient Code:")); top.add(pidP);

        top.add(new JLabel("Name:")); top.add(txtBillName);
        top.add(new JLabel("Phone:")); top.add(txtBillPhone);
        top.add(new JLabel("Address:")); top.add(new JScrollPane(txtBillAddr));
        top.add(new JLabel("Email:")); top.add(txtBillEmail);
        p.add(top);

        loadNextInvoiceID();

        JPanel cart = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 10)); 
        cart.setBounds(50, 130, 1100, 60); cart.setBackground(new Color(255,255,255,240));
        txtBillItem=new JTextField(15); txtBillQty=new JTextField("1",5); txtBillRate=new JTextField("0",8);
        
        // --- VALIDATION ---
        UIUtils.setNumericOnly(txtBillQty, 5);
        UIUtils.setNumericOnly(txtBillRate, 8);
        // ------------------

        JButton btnAdd = new JButton("Add"); UIUtils.styleButton(btnAdd, UIUtils.COLOR_ORANGE); btnAdd.setForeground(Color.BLACK);
        cart.add(new JLabel("Item:")); cart.add(txtBillItem); cart.add(new JLabel("Qty:")); cart.add(txtBillQty); cart.add(new JLabel("Rate:")); cart.add(txtBillRate); cart.add(btnAdd);
        p.add(cart);

        billModel = new DefaultTableModel(new String[]{"Item", "Qty", "Rate", "Total"}, 0);
        billTable = new JTable(billModel); UIUtils.styleTable(billTable);
        JScrollPane sp = new JScrollPane(billTable); sp.setBounds(50, 200, 1100, 290); p.add(sp);

        JPanel foot = new JPanel(new FlowLayout(FlowLayout.RIGHT, 20, 10)); 
        foot.setBounds(50, 500, 1100, 70); foot.setOpaque(false);
        txtBillDiscount = new JTextField("0", 5); 
        UIUtils.setNumericOnly(txtBillDiscount, 3);

        txtBillGrandTotal = new JTextField("0.00", 10); txtBillGrandTotal.setFont(new Font("Arial", Font.BOLD, 24)); txtBillGrandTotal.setEditable(false);
        JButton btnEmail = new JButton("Save & Email"); UIUtils.styleButton(btnEmail, new Color(23, 162, 184));
        JButton btnPrint = new JButton(" Save & Print"); UIUtils.styleButton(btnPrint, new Color(40, 167, 69));
        JButton btnClearAll = new JButton("CLEAR ALL"); UIUtils.styleButton(btnClearAll, Color.GRAY);
        
        foot.add(new JLabel("Discount %:")); foot.add(txtBillDiscount);
        foot.add(new JLabel("Grand Total:")); foot.add(txtBillGrandTotal); 
        foot.add(btnEmail); foot.add(btnPrint); foot.add(btnClearAll);
        p.add(foot);

        // Logic
        btnF.addActionListener(e -> {
            try { Connection con=DBConnection.connect(); PreparedStatement pst=con.prepareStatement("SELECT * FROM patients WHERE patient_code=?"); 
            pst.setString(1, txtBillPid.getText()); ResultSet rs=pst.executeQuery(); 
            if(rs.next()) { 
                txtBillName.setText(rs.getString("name"));
                txtBillPhone.setText(rs.getString("phone"));
                txtBillAddr.setText(rs.getString("address"));
                txtBillEmail.setText(rs.getString("email"));
            } else JOptionPane.showMessageDialog(this, "Not Found"); con.close(); } catch(Exception ex){}
        });

        btnAdd.addActionListener(e -> {
            try { 
                double itemTot = Integer.parseInt(txtBillQty.getText()) * Double.parseDouble(txtBillRate.getText());
                billModel.addRow(new Object[]{txtBillItem.getText(), txtBillQty.getText(), txtBillRate.getText(), itemTot});
                subTotal += itemTot;
                calculateTotal();
                txtBillItem.setText(""); txtBillQty.setText("1"); txtBillRate.setText("0"); txtBillItem.requestFocus();
            } catch(Exception ex) { JOptionPane.showMessageDialog(this, "Invalid Format"); }
        });

        btnClearAll.addActionListener(e -> {
            txtBillPid.setText(""); txtBillName.setText(""); txtBillPhone.setText(""); txtBillAddr.setText(""); txtBillEmail.setText("");
            txtBillItem.setText(""); txtBillQty.setText("1"); txtBillRate.setText("0"); txtBillDiscount.setText("0");
            billModel.setRowCount(0); subTotal = 0; txtBillGrandTotal.setText("0.00");
            loadNextInvoiceID();
        });

        txtBillDiscount.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e) { calculateTotal(); }
            public void removeUpdate(DocumentEvent e) { calculateTotal(); }
            public void changedUpdate(DocumentEvent e) { calculateTotal(); }
        });

        ActionListener saveAction = e -> finalizeBill(e.getSource() == btnEmail);
        btnEmail.addActionListener(saveAction);
        btnPrint.addActionListener(saveAction);

        return p;
    }

    private void calculateTotal() {
        try {
            double disc = Double.parseDouble(txtBillDiscount.getText().isEmpty() ? "0" : txtBillDiscount.getText());
            double grand = subTotal - (subTotal * disc / 100);
            txtBillGrandTotal.setText(String.format("%.2f", grand));
        } catch(NumberFormatException e) { }
    }

    private void loadNextInvoiceID() {
        try { Connection con = DBConnection.connect();
            ResultSet rs = con.createStatement().executeQuery("SELECT MAX(id) FROM bills");
            if(rs.next()) txtBillInvoice.setText(String.valueOf(rs.getInt(1) + 1));
            else txtBillInvoice.setText("1");
            con.close();
        } catch(Exception e) { txtBillInvoice.setText("1"); }
    }

    private void finalizeBill(boolean isEmail) {
        if(billModel.getRowCount() == 0 || txtBillName.getText().isEmpty()) return;
        StringBuilder sb = new StringBuilder();
        sb.append("      HOSPITAL INVOICE      \n");
        sb.append("Invoice #: ").append(txtBillInvoice.getText()).append("\n");
        sb.append("Date: ").append(new Date()).append("\n");
        sb.append("Patient: ").append(txtBillName.getText()).append(" (ID: ").append(txtBillPid.getText()).append(")\n");
        sb.append("Phone: ").append(txtBillPhone.getText()).append("\n");
        sb.append("------------------------------------------------\n");
        sb.append(String.format("%-20s %-5s %-10s %-10s\n", "Item", "Qty", "Rate", "Total"));
        sb.append("------------------------------------------------\n");
        StringBuilder dbItems = new StringBuilder();
        for(int i=0; i<billModel.getRowCount(); i++) {
            sb.append(String.format("%-20s %-5s %-10s %-10s\n", billModel.getValueAt(i,0), billModel.getValueAt(i,1), billModel.getValueAt(i,2), billModel.getValueAt(i,3)));
            dbItems.append(billModel.getValueAt(i,0)).append(", ");
        }
        sb.append("------------------------------------------------\n");
        sb.append("Subtotal: ").append(subTotal).append("\n");
        sb.append("Discount: ").append(txtBillDiscount.getText()).append("%\n");
        sb.append("GRAND TOTAL: ").append(txtBillGrandTotal.getText()).append("\n");

        try { Connection con=DBConnection.connect(); 
            String sql="INSERT INTO bills (patient_code, patient_name, bill_date, particulars, total_amount) VALUES (?,?,CURDATE(),?,?)";
            PreparedStatement pst=con.prepareStatement(sql); 
            pst.setLong(1, Long.parseLong(txtBillPid.getText())); pst.setString(2, txtBillName.getText());
            pst.setString(3, dbItems.toString()); pst.setDouble(4, Double.parseDouble(txtBillGrandTotal.getText())); pst.executeUpdate(); con.close();
        } catch(Exception ex) { JOptionPane.showMessageDialog(this, "DB Error: " + ex.getMessage()); return; }

        if(isEmail) {
            if(txtBillEmail.getText().isEmpty()) { JOptionPane.showMessageDialog(this, "Enter Email Address!"); return; }
            new Thread(() -> Email.sendEmail(txtBillEmail.getText(), "Hospital Invoice #" + txtBillInvoice.getText(), sb.toString())).start();
            JOptionPane.showMessageDialog(this, "Bill Saved & Email Sent!");
        } else {
            JTextPane printPane = new JTextPane(); printPane.setText(sb.toString()); printPane.setFont(new Font("Monospaced", Font.PLAIN, 12));
            try { printPane.print(null, null, true, null, null, true); JOptionPane.showMessageDialog(this, "Bill Saved & Sent to Printer");
            } catch (PrinterException e) { e.printStackTrace(); }
        }
        billModel.setRowCount(0); subTotal=0; txtBillGrandTotal.setText("0.00");
        loadNextInvoiceID();
    }
    
    // --- HELPERS ---
    private void addLabel(JPanel p, String txt, int x, int y, GridBagConstraints gbc) {
        gbc.gridx = x; gbc.gridy = y; gbc.anchor = GridBagConstraints.EAST;
        JLabel l = new JLabel(txt); l.setFont(font18); p.add(l, gbc);
        gbc.anchor = GridBagConstraints.CENTER; 
    }

    private void addSearch(JPanel panel, JTable table, DefaultTableModel model) {
        JPanel sp = new JPanel(new FlowLayout(FlowLayout.RIGHT)); sp.setOpaque(false);
        JTextField txt = new JTextField(20);
        sp.add(new JLabel("Search Records:")); sp.add(txt);
        panel.add(sp, BorderLayout.NORTH);
        TableRowSorter<DefaultTableModel> sorter = new TableRowSorter<>(model);
        table.setRowSorter(sorter);
        txt.addKeyListener(new KeyAdapter() { public void keyReleased(KeyEvent e) {
            sorter.setRowFilter(RowFilter.regexFilter("(?i)" + txt.getText()));
        }});
    }

    private String generateID() { return String.valueOf(100000 + new Random().nextInt(900000)); }
}