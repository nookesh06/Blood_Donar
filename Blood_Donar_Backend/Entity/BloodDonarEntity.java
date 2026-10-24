package com.bloodDonar.Entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blood_donor")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BloodDonarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false, unique = true)
    private Long mobileNumber;

    @Column(nullable = false, unique = true)
    private String emailId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 3)
    private String bloodGroup;


    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = true)
    private String city;
    
    @Column(nullable = true)
    private String gender;
    
    @Column(nullable = true)
    private Double longitude;
    
    @Column(nullable = true)
    private Double latitude;
}
