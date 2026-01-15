package com.mycompany.hospitalmanagementsystem;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableRowSorter;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;

public class AdminDashboard extends JFrame {
    
    Font font14 = new Font("Segoe UI", Font.BOLD, 14);
    JTextField tId, tName, tUser, tEmailUser, tPhone, tNMC;
    JTextArea tAddr;
    JComboBox<String> cRole, cDept;
    JLabel lNMC, lDept;

    public AdminDashboard() {
        setTitle("Admin Dashboard"); 
        setSize(1366, 768); 
        setDefaultCloseOperation(EXIT_ON_CLOSE); 
        setLocationRelativeTo(null);
        
        JPanel mainPanel = UIUtils.createBackgroundPanel("hms.jpg"); 
        mainPanel.setLayout(new BorderLayout()); 
        setContentPane(mainPanel);

        JPanel header = new JPanel(new BorderLayout()); 
        header.setBackground(new Color(0,0,0,200)); 
        header.setPreferredSize(new Dimension(1200, 70));
        
        JLabel title = new JLabel("   ADMIN CONTROL PANEL"); 
        title.setForeground(Color.WHITE); 
        title.setFont(new Font("Segoe UI", Font.BOLD, 24));
        
        JButton btnLogout = new JButton("Logout "); 
        UIUtils.styleButton(btnLogout, new Color(220, 53, 69));
        btnLogout.addActionListener(e -> { dispose(); new Login().setVisible(true); });
        
        header.add(title, BorderLayout.WEST); header.add(btnLogout, BorderLayout.EAST); 
        mainPanel.add(header, BorderLayout.NORTH);

        JTabbedPane tabs = new JTabbedPane(); 
        tabs.setFont(font14);
        
        tabs.addTab("Analytics", createHomePanel());
        tabs.addTab(" Add / Manage User", createUserPanel()); 
        tabs.addTab("️ Doctors List", createDoctorView()); 
        tabs.addTab(" Staff List", createStaffView()); 
        tabs.addTab(" Patient Records", createPatientView()); 
        tabs.addTab(" All Appointments", createApptView()); 
        
        mainPanel.add(tabs, BorderLayout.CENTER);
    }

    // --- HELPER: Create Glass Panel ---
    private JPanel createGlassPanel(LayoutManager layout) {
        JPanel p = new JPanel(layout) {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setColor(new Color(255, 255, 255, 170));
                g2.fillRect(0, 0, getWidth(), getHeight());
                g2.dispose();
            }
        };
        p.setOpaque(false);
        return p;
    }

    // 1. HOME
    private JPanel createHomePanel() {
        JPanel p = new JPanel(new FlowLayout(FlowLayout.CENTER, 30, 30)); p.setOpaque(false);
        p.add(createCard("Total Patients", "SELECT COUNT(*) FROM patients", new Color(23, 162, 184)));
        p.add(createCard("Active Doctors", "SELECT COUNT(*) FROM users WHERE role='doctor' AND is_active=TRUE", new Color(40, 167, 69)));
        p.add(createCard("Active Staff", "SELECT COUNT(*) FROM users WHERE role='staff' AND is_active=TRUE", new Color(108, 117, 125)));
        p.add(createCard("Total Revenue", "SELECT SUM(total_amount) FROM bills", new Color(220, 53, 69)));
        return p;
    }

    private JPanel createCard(String title, String query, Color bg) {
        JPanel c = new JPanel(new BorderLayout()); c.setPreferredSize(new Dimension(250, 150)); c.setBackground(bg);
        c.setBorder(BorderFactory.createLineBorder(Color.WHITE, 2));
        JLabel lT = new JLabel(title, SwingConstants.CENTER); lT.setFont(new Font("Segoe UI", Font.BOLD, 18)); lT.setForeground(Color.WHITE);
        JLabel lV = new JLabel("...", SwingConstants.CENTER); lV.setFont(new Font("Segoe UI", Font.BOLD, 36)); lV.setForeground(Color.WHITE);
        c.add(lT, BorderLayout.NORTH); c.add(lV, BorderLayout.CENTER);
        new Thread(() -> {
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery(query);
                if(rs.next()) { String val=rs.getString(1); lV.setText(val==null?"0":val); } con.close();
            } catch(Exception e){ lV.setText("0"); }
        }).start();
        return c;
    }

    // 2. CREATE USER
    private JPanel createUserPanel() {
        JPanel p = new JPanel(new BorderLayout(15,15)); p.setOpaque(false); p.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        
        JPanel form = createGlassPanel(new GridBagLayout()); 
        form.setBorder(BorderFactory.createTitledBorder("Register / Update User"));
        GridBagConstraints gbc = new GridBagConstraints(); gbc.insets = new Insets(10, 10, 10, 10); gbc.fill = GridBagConstraints.HORIZONTAL;

        tId = new JTextField(); tId.setEditable(false); tId.setVisible(false);
        tName = new JTextField(15); tUser = new JTextField(15); 
        tPhone = new JTextField(10); 
        tAddr = new JTextArea(3, 15); tAddr.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        
        JPanel pEmail = new JPanel(new BorderLayout()); pEmail.setOpaque(false);
        tEmailUser = new JTextField();
        pEmail.add(tEmailUser, BorderLayout.CENTER); pEmail.add(new JLabel("@gmail.com"), BorderLayout.EAST);

        cRole = new JComboBox<>(new String[]{"Staff", "Doctor"});
        tNMC = new JTextField(15);
        String[] departments = { "Primary Care", "OPD", "IPD", "Emergency", "Cardiology", "Dermatology", "Neurology", "General Surgery", "Orthopedics", "ENT", "Radiology", "Pharmacy", "ICU" }; 
        cDept = new JComboBox<>(departments);
        lNMC = new JLabel("NMC ID:"); lDept = new JLabel("Department:");

        gbc.gridx=0; gbc.gridy=0; form.add(new JLabel("Role:"), gbc); gbc.gridx=1; form.add(cRole, gbc);
        gbc.gridx=2; form.add(new JLabel("Full Name:"), gbc); gbc.gridx=3; form.add(tName, gbc);

        gbc.gridx=0; gbc.gridy=1; form.add(new JLabel("Address:"), gbc); gbc.gridx=1; gbc.gridwidth=3; form.add(new JScrollPane(tAddr), gbc); gbc.gridwidth=1;

        gbc.gridx=0; gbc.gridy=2; form.add(new JLabel("Phone:"), gbc);
        JPanel pPhone = new JPanel(new BorderLayout(5,0)); pPhone.setOpaque(false); pPhone.add(new JLabel("🇳🇵 977-"), BorderLayout.WEST); pPhone.add(tPhone, BorderLayout.CENTER);
        gbc.gridx=1; form.add(pPhone, gbc);
        
        gbc.gridx=2; form.add(new JLabel("Email User:"), gbc); gbc.gridx=3; form.add(pEmail, gbc);

        gbc.gridx=0; gbc.gridy=3; form.add(new JLabel("Username:"), gbc); gbc.gridx=1; form.add(tUser, gbc);

        gbc.gridx=0; gbc.gridy=4; form.add(lNMC, gbc); gbc.gridx=1; form.add(tNMC, gbc); gbc.gridx=2; form.add(lDept, gbc); gbc.gridx=3; form.add(cDept, gbc);

        JPanel btnFormP = new JPanel(new FlowLayout(FlowLayout.CENTER)); btnFormP.setOpaque(false);
        JButton btnC = new JButton(" CREATE NEW"); UIUtils.styleButton(btnC, new Color(40,167,69));
        JButton btnU = new JButton(" UPDATE USER"); UIUtils.styleButton(btnU, UIUtils.COLOR_ORANGE); btnU.setForeground(Color.BLACK);
        JButton btnClear = new JButton(" CLEAR"); UIUtils.styleButton(btnClear, Color.GRAY);
        btnFormP.add(btnC); btnFormP.add(btnU); btnFormP.add(btnClear);

        gbc.gridx=1; gbc.gridy=5; gbc.gridwidth=3; form.add(btnFormP, gbc);
        p.add(form, BorderLayout.NORTH);

        Runnable toggleDocFields = () -> { boolean isDoc = cRole.getSelectedItem().equals("Doctor"); lNMC.setVisible(isDoc); tNMC.setVisible(isDoc); lDept.setVisible(isDoc); cDept.setVisible(isDoc); };
        cRole.addActionListener(e -> toggleDocFields.run()); toggleDocFields.run();

        btnC.addActionListener(e -> {
            if(!validateInput()) return;
            try { 
                Connection con = DBConnection.connect(); 
                String pass = UIUtils.generatePassword();
                String fullEmail = tEmailUser.getText().trim() + "@gmail.com";
                String fullPhone = "977" + tPhone.getText().trim();
                String role = cRole.getSelectedItem().toString().toLowerCase();

                String sql = "INSERT INTO users (name, email, username, password, role, address, phone, nmc_number, department, is_active, requires_password) VALUES (?,?,?,?,?,?,?,?,?,TRUE,TRUE)";
                PreparedStatement pst = con.prepareStatement(sql);
                pst.setString(1, tName.getText()); pst.setString(2, fullEmail); pst.setString(3, tUser.getText()); 
                pst.setString(4, pass); pst.setString(5, role); pst.setString(6, tAddr.getText()); pst.setString(7, fullPhone);
                if(role.equals("doctor")) { pst.setString(8, tNMC.getText()); pst.setString(9, cDept.getSelectedItem().toString()); } 
                else { pst.setNull(8, Types.VARCHAR); pst.setNull(9, Types.VARCHAR); }

                pst.executeUpdate(); 
                JOptionPane.showMessageDialog(this, "✅ User Created!\nPass: " + pass + "\n(Email Sending...)"); 
                new Thread(()->Email.sendPasswordEmail(fullEmail, tName.getText(), tUser.getText(), pass)).start();
                con.close(); clearForm();
            } catch(Exception ex){ JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage()); }
        });

        btnU.addActionListener(e -> {
            if(tId.getText().isEmpty()) { JOptionPane.showMessageDialog(this, "Select a user from table to edit first!"); return; }
            if(!validateInput()) return;
            try {
                Connection con = DBConnection.connect();
                String fullEmail = tEmailUser.getText().trim() + "@gmail.com";
                String fullPhone = "977" + tPhone.getText().trim();
                String role = cRole.getSelectedItem().toString().toLowerCase();

                String sql = "UPDATE users SET name=?, email=?, username=?, role=?, address=?, phone=?, nmc_number=?, department=? WHERE id=?";
                PreparedStatement pst = con.prepareStatement(sql);
                pst.setString(1, tName.getText()); pst.setString(2, fullEmail); pst.setString(3, tUser.getText());
                pst.setString(4, role); pst.setString(5, tAddr.getText()); pst.setString(6, fullPhone);
                if(role.equals("doctor")) { pst.setString(7, tNMC.getText()); pst.setString(8, cDept.getSelectedItem().toString()); } 
                else { pst.setNull(7, Types.VARCHAR); pst.setNull(8, Types.VARCHAR); }
                pst.setInt(9, Integer.parseInt(tId.getText()));

                pst.executeUpdate(); con.close();
                JOptionPane.showMessageDialog(this, " User Updated Successfully!");
                clearForm();
            } catch(Exception ex) { JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage()); }
        });

        btnClear.addActionListener(e -> clearForm());

        // Table
        JPanel tableP = new JPanel(new BorderLayout());
        tableP.setBorder(BorderFactory.createTitledBorder("All System Users"));
        DefaultTableModel userModel = new DefaultTableModel(new String[]{"ID", "Name", "Role", "User", "Phone", "Email", "Status"}, 0);
        JTable userTable = new JTable(userModel); UIUtils.styleTable(userTable);
        addSearch(tableP, userTable, userModel);
        tableP.add(new JScrollPane(userTable), BorderLayout.CENTER);
        
        JPanel acts = new JPanel(); acts.setOpaque(false);
        JButton bRef = new JButton("Refresh"); UIUtils.styleButton(bRef, UIUtils.COLOR_BLUE);
        JButton bEdit = new JButton("Edit Selected"); UIUtils.styleButton(bEdit, UIUtils.COLOR_ORANGE); bEdit.setForeground(Color.BLACK);
        JButton bDel = new JButton("Delete Selected"); UIUtils.styleButton(bDel, UIUtils.COLOR_RED);
        JButton bTog = new JButton("Toggle Active"); UIUtils.styleButton(bTog, Color.GRAY);
        
        acts.add(bRef); acts.add(bEdit); acts.add(bDel); acts.add(bTog);
        tableP.add(acts, BorderLayout.SOUTH);
        p.add(tableP, BorderLayout.CENTER);

        Runnable load = () -> {
            userModel.setRowCount(0);
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery("SELECT id,name,role,username,phone,email,is_active FROM users");
            while(rs.next()) userModel.addRow(new Object[]{ rs.getInt("id"), rs.getString("name"), rs.getString("role"), rs.getString("username"), rs.getString("phone"), rs.getString("email"), rs.getBoolean("is_active")?"Active":"Disabled" }); con.close(); } catch(Exception e){}
        };
        bRef.addActionListener(e -> load.run()); load.run();

        bEdit.addActionListener(e -> {
            int r = userTable.getSelectedRow();
            if(r == -1) return;
            try {
                int id = Integer.parseInt(userTable.getValueAt(r, 0).toString());
                Connection con = DBConnection.connect();
                ResultSet rs = con.createStatement().executeQuery("SELECT * FROM users WHERE id=" + id);
                if(rs.next()) {
                    tId.setText(String.valueOf(id));
                    tName.setText(rs.getString("name"));
                    tUser.setText(rs.getString("username"));
                    tAddr.setText(rs.getString("address"));
                    String ph = rs.getString("phone");
                    tPhone.setText(ph != null ? ph.replace("977", "") : "");
                    String em = rs.getString("email");
                    tEmailUser.setText(em != null ? em.split("@")[0] : "");
                    String role = rs.getString("role");
                    cRole.setSelectedItem(role.substring(0, 1).toUpperCase() + role.substring(1));
                    if(role.equalsIgnoreCase("doctor")) {
                        tNMC.setText(rs.getString("nmc_number"));
                        cDept.setSelectedItem(rs.getString("department"));
                    }
                }
                con.close();
            } catch(Exception ex) { ex.printStackTrace(); }
        });

        bDel.addActionListener(e -> { 
            if(userTable.getSelectedRow()!=-1 && JOptionPane.showConfirmDialog(this,"Delete User?")==0) try{ Connection con=DBConnection.connect(); con.createStatement().executeUpdate("DELETE FROM users WHERE id="+userTable.getValueAt(userTable.getSelectedRow(),0)); con.close(); load.run(); }catch(Exception ex){} 
        });
        
        bTog.addActionListener(e -> { 
            if(userTable.getSelectedRow()!=-1) try{ Connection con=DBConnection.connect(); con.createStatement().executeUpdate("UPDATE users SET is_active=NOT is_active WHERE id="+userTable.getValueAt(userTable.getSelectedRow(),0)); con.close(); load.run(); }catch(Exception ex){} 
        });

        return p;
    }

    // 3. STAFF VIEW
    private JPanel createStaffView() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        DefaultTableModel m = new DefaultTableModel(new String[]{"Name", "Phone", "Email", "Address", "Status"}, 0);
        JTable t = new JTable(m); UIUtils.styleTable(t);
        JPanel c = new JPanel(new BorderLayout()); c.setBorder(BorderFactory.createTitledBorder("Registered Staff Members"));
        addSearch(c, t, m); c.add(new JScrollPane(t), BorderLayout.CENTER);
        JButton bRef = new JButton("Refresh Staff"); UIUtils.styleButton(bRef, UIUtils.COLOR_TEAL);
        c.add(bRef, BorderLayout.SOUTH); p.add(c, BorderLayout.CENTER);
        bRef.addActionListener(e -> {
            m.setRowCount(0);
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery("SELECT name, phone, email, address, is_active FROM users WHERE role='staff'");
            while(rs.next()) m.addRow(new Object[]{rs.getString("name"), rs.getString("phone"), rs.getString("email"), rs.getString("address"), rs.getBoolean("is_active")?"Active":"Disabled"}); con.close(); } catch(Exception ex){}
        });
        bRef.doClick(); return p;
    }

    // 4. DOCTOR VIEW
    private JPanel createDoctorView() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        DefaultTableModel m = new DefaultTableModel(new String[]{"Name", "NMC ID", "Department", "Phone", "Email", "Status"}, 0);
        JTable t = new JTable(m); UIUtils.styleTable(t);
        JPanel c = new JPanel(new BorderLayout()); c.setBorder(BorderFactory.createTitledBorder("Registered Doctors"));
        addSearch(c, t, m); c.add(new JScrollPane(t), BorderLayout.CENTER);
        JButton bRef = new JButton("Refresh Doctors"); UIUtils.styleButton(bRef, UIUtils.COLOR_TEAL);
        c.add(bRef, BorderLayout.SOUTH); p.add(c, BorderLayout.CENTER);
        bRef.addActionListener(e -> {
            m.setRowCount(0);
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery("SELECT name, nmc_number, department, phone, email, is_active FROM users WHERE role='doctor'");
            while(rs.next()) m.addRow(new Object[]{rs.getString("name"), rs.getString("nmc_number"), rs.getString("department"), rs.getString("phone"), rs.getString("email"), rs.getBoolean("is_active")?"Active":"Disabled"}); con.close(); } catch(Exception ex){}
        });
        bRef.doClick(); return p;
    }

    // 5. PATIENT VIEW
    private JPanel createPatientView() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        DefaultTableModel m = new DefaultTableModel(new String[]{"Patient Code", "Name", "Phone", "Age", "Sex", "Address", "Email"}, 0);
        JTable t = new JTable(m); UIUtils.styleTable(t);
        JPanel c = new JPanel(new BorderLayout()); c.setBorder(BorderFactory.createTitledBorder("Patient Records"));
        addSearch(c, t, m); c.add(new JScrollPane(t), BorderLayout.CENTER);
        JButton bRef = new JButton("Refresh Patients"); UIUtils.styleButton(bRef, UIUtils.COLOR_TEAL);
        c.add(bRef, BorderLayout.SOUTH); p.add(c, BorderLayout.CENTER);
        bRef.addActionListener(e -> {
            m.setRowCount(0);
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery("SELECT patient_code, name, phone, age, sex, address, email FROM patients");
            while(rs.next()) m.addRow(new Object[]{rs.getString("patient_code"), rs.getString("name"), rs.getString("phone"), rs.getString("age"), rs.getString("sex"), rs.getString("address"), rs.getString("email")}); con.close(); } catch(Exception ex){}
        });
        bRef.doClick(); return p;
    }

    // 6. APPOINTMENT VIEW
    private JPanel createApptView() {
        JPanel p = new JPanel(new BorderLayout(10,10)); p.setOpaque(false);
        p.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        DefaultTableModel m = new DefaultTableModel(new String[]{"Appt ID", "Patient Name", "Doctor Name", "Date", "Status"}, 0);
        JTable t = new JTable(m); UIUtils.styleTable(t);
        JPanel c = new JPanel(new BorderLayout()); c.setBorder(BorderFactory.createTitledBorder("All Appointments"));
        addSearch(c, t, m); c.add(new JScrollPane(t), BorderLayout.CENTER);
        JButton bRef = new JButton("Refresh Appointments"); UIUtils.styleButton(bRef, UIUtils.COLOR_TEAL);
        c.add(bRef, BorderLayout.SOUTH); p.add(c, BorderLayout.CENTER);
        bRef.addActionListener(e -> {
            m.setRowCount(0);
            try { Connection con=DBConnection.connect(); ResultSet rs=con.createStatement().executeQuery("SELECT id, patient_name, doctor_name, appt_date, status FROM appointments ORDER BY appt_date DESC");
            while(rs.next()) m.addRow(new Object[]{rs.getInt("id"), rs.getString("patient_name"), rs.getString("doctor_name"), rs.getString("appt_date"), rs.getString("status")}); con.close(); } catch(Exception ex){}
        });
        bRef.doClick(); return p;
    }

    // HELPERS
    private void addSearch(JPanel panel, JTable table, DefaultTableModel model) {
        JPanel sp = new JPanel(new FlowLayout(FlowLayout.RIGHT)); sp.setOpaque(false);
        JTextField txt = new JTextField(20);
        sp.add(new JLabel("Search:")); sp.add(txt);
        panel.add(sp, BorderLayout.NORTH);
        TableRowSorter<DefaultTableModel> sorter = new TableRowSorter<>(model);
        table.setRowSorter(sorter);
        txt.addKeyListener(new KeyAdapter() { public void keyReleased(KeyEvent e) {
            sorter.setRowFilter(RowFilter.regexFilter("(?i)" + txt.getText()));
        }});
    }

    private boolean validateInput() {
        if(tName.getText().isEmpty() || tUser.getText().isEmpty() || tEmailUser.getText().isEmpty() || tPhone.getText().isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please fill all fields."); return false;
        }
        if(tPhone.getText().length() != 10) { JOptionPane.showMessageDialog(this, "Phone must be 10 digits."); return false; }
        if(cRole.getSelectedItem().equals("Doctor") && tNMC.getText().isEmpty()) { JOptionPane.showMessageDialog(this, "Doctors must have an NMC ID."); return false; }
        return true;
    }

    private void clearForm() {
        tId.setText(""); tName.setText(""); tUser.setText(""); tEmailUser.setText(""); tPhone.setText(""); tAddr.setText(""); tNMC.setText("");
    }
}