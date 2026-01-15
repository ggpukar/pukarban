package com.mycompany.hospitalmanagementsystem;

import java.sql.Connection;
import java.sql.DriverManager;
import javax.swing.JOptionPane;

public class DBConnection {
    public static Connection connect() {
        try {
            // Load Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Connect to database (Adjust user/password if yours is different)
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/hospital_db", "root", "MYsql@69");
            return con;
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, "Database Connection Failed: " + e.getMessage());
            return null;
        }
    }
}