package com.mycompany.hospitalmanagementsystem;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.*;

public class DoctorDashboard extends JFrame {
    int docId; 
    String docName; 
    DefaultTableModel model;
    JTable table;

    public DoctorDashboard(int id, String username) {
        this.docId = id; 
        this.docName = username;
        
        setTitle("Doctor Dashboard"); 
        setSize(1280, 750); 
        setDefaultCloseOperation(EXIT_ON_CLOSE); 
        setLocationRelativeTo(null);
        
        JPanel mainPanel = UIUtils.createBackgroundPanel("hms.jpg"); 
        mainPanel.setLayout(new BorderLayout()); 
        setContentPane(mainPanel);

        // Header
        JPanel header = new JPanel(new BorderLayout()); 
        header.setBackground(new Color(0, 100, 150, 220)); 
        header.setPreferredSize(new Dimension(1200, 70));
        header.setBorder(BorderFactory.createEmptyBorder(0, 20, 0, 20));

        JLabel title = new JLabel("👨‍⚕️ DOCTOR PORTAL: " + username.toUpperCase()); 
        title.setForeground(Color.WHITE); 
        title.setFont(new Font("Segoe UI", Font.BOLD, 22));
        
        JButton btnOut = new JButton("Logout ➜"); 
        UIUtils.styleButton(btnOut, new Color(220,53,69));
        btnOut.addActionListener(e -> { dispose(); new Login().setVisible(true); });
        
        header.add(title, BorderLayout.WEST); 
        header.add(btnOut, BorderLayout.EAST); 
        mainPanel.add(header, BorderLayout.NORTH);

        // Content
        JPanel content = new JPanel(new BorderLayout(15,15)); 
        content.setOpaque(false); 
        content.setBorder(BorderFactory.createEmptyBorder(20,20,20,20));
        
        JPanel glass = new JPanel(new BorderLayout()); 
        glass.setBackground(new Color(255,255,255,220)); 
        glass.setBorder(BorderFactory.createTitledBorder("My Appointments (Sorted by Date)"));
        
        model = new DefaultTableModel(new String[]{"Appt ID", "Patient ID", "Name", "Age / Sex", "Phone", "Date", "Status"}, 0);
        table = new JTable(model); 
        UIUtils.styleTable(table);
        
        glass.add(new JScrollPane(table), BorderLayout.CENTER); 
        content.add(glass, BorderLayout.CENTER);

        // Buttons
        JPanel bP = new JPanel(); bP.setOpaque(false);
        JButton bRefresh = new JButton("Refresh List"); UIUtils.styleButton(bRefresh, new Color(0,102,204));
        JButton bHistory = new JButton("📜 Patient History"); UIUtils.styleButton(bHistory, UIUtils.COLOR_ORANGE); bHistory.setForeground(Color.BLACK);
        JButton bPrescribe = new JButton("💊 Prescribe"); UIUtils.styleButton(bPrescribe, new Color(40,167,69));
        
        bP.add(bRefresh); 
        bP.add(bHistory); 
        bP.add(bPrescribe); 
        content.add(bP, BorderLayout.SOUTH);
        
        mainPanel.add(content, BorderLayout.CENTER);

        loadMyData();

        bRefresh.addActionListener(e -> loadMyData());
        
        bHistory.addActionListener(e -> {
            int r = table.getSelectedRow();
            if(r != -1) {
                String pid = table.getValueAt(r, 1).toString();
                String pname = table.getValueAt(r, 2).toString();
                viewHistory(pid, pname);
            } else JOptionPane.showMessageDialog(this, "Select a patient first.");
        });

        bPrescribe.addActionListener(e -> {
            int r = table.getSelectedRow();
            if(r != -1) {
                String status = table.getValueAt(r, 6).toString();
                if(status.equalsIgnoreCase("Advised")) {
                    JOptionPane.showMessageDialog(this, "✅ This patient has already been advised.");
                    return;
                }

                String apptId = table.getValueAt(r, 0).toString();
                String pid = table.getValueAt(r, 1).toString();
                String pname = table.getValueAt(r, 2).toString();
                
                new PrescriptionDialog(this, docName, pid, pname, apptId).setVisible(true);
                loadMyData();
            } else {
                JOptionPane.showMessageDialog(this, "Please select a patient row first.");
            }
        });
    }

    void loadMyData() {
        try { 
            Connection con = DBConnection.connect();
            String sql = "SELECT a.id AS appt_id, a.patient_code, a.patient_name, a.appt_date, a.status, " +
                         "p.age, p.sex, p.phone " +
                         "FROM appointments a " +
                         "LEFT JOIN patients p ON a.patient_code = p.patient_code " +
                         "WHERE a.doctor_name=? " +
                         "ORDER BY a.appt_date DESC";

            PreparedStatement pst = con.prepareStatement(sql);
            pst.setString(1, this.docName); 
            ResultSet rs = pst.executeQuery();
            
            model.setRowCount(0);
            while(rs.next()) {
                String ageSex = (rs.getString("age") != null ? rs.getString("age") : "N/A") + " / " + (rs.getString("sex") != null ? rs.getString("sex") : "N/A");
                
                model.addRow(new Object[]{ 
                    rs.getString("appt_id"), 
                    rs.getString("patient_code"), 
                    rs.getString("patient_name"), 
                    ageSex,                       
                    rs.getString("phone"),        
                    rs.getString("appt_date"), 
                    rs.getString("status") 
                });
            }
            con.close();
        } catch(Exception e) { e.printStackTrace(); }
    }

    private void viewHistory(String pid, String pname) {
        JDialog d = new JDialog(this, "Medical History: " + pname, true);
        d.setSize(700, 450); d.setLocationRelativeTo(this);
        DefaultTableModel hm = new DefaultTableModel(new String[]{"Date", "Doctor", "Diagnosis", "Medicines"}, 0);
        JTable ht = new JTable(hm); UIUtils.styleTable(ht);
        try { Connection con=DBConnection.connect(); 
            ResultSet rs=con.createStatement().executeQuery("SELECT * FROM prescriptions WHERE patient_code="+pid+" ORDER BY prescribed_date DESC");
            while(rs.next()) hm.addRow(new Object[]{rs.getString("prescribed_date"), rs.getString("doctor_name"), rs.getString("diagnosis"), rs.getString("medicines")}); con.close();
        } catch(Exception e){}
        d.add(new JScrollPane(ht)); d.setVisible(true);
    }
}