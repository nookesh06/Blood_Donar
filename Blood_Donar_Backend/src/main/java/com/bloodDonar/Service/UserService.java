package com.bloodDonar.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.bloodDonar.DTO.LocationDetailsDTO;
import com.bloodDonar.DTO.LoginDTO;
import com.bloodDonar.DTO.RegistrationDTO;
import com.bloodDonar.Entity.BloodDonarEntity;
import com.bloodDonar.repo.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ================= REGISTER =================
    public ResponseEntity<String> DonarRegistration(RegistrationDTO dto) {

        BloodDonarEntity entity = new BloodDonarEntity();
        entity.setUserName(dto.getUserName());
        entity.setEmailId(dto.getEmailId());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setPassword(passwordEncoder.encode(dto.getPassword()));

        userRepository.save(entity);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Registration successful");
    }


    // ================= LOGIN =================
    public ResponseEntity<String> login(LoginDTO dto) {

        BloodDonarEntity entity = userRepository
                .findByEmailId(dto.getEmailId())
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!passwordEncoder.matches(dto.getPassword(), entity.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return ResponseEntity.ok("Login successful");
    }

    // ================= SAVE LOCATION =================
    public ResponseEntity<String> saveLocation(String emailId, LocationDetailsDTO dto) {

        BloodDonarEntity entity = userRepository.findByEmailId(emailId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        entity.setCity(dto.getCity());
        entity.setGender(dto.getGender().toLowerCase());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());

        userRepository.save(entity);

        return ResponseEntity.ok("Location saved successfully");
    }


    // ================= SEARCH DONORS =================
    public List<BloodDonarEntity> getDonors(String bloodGroup, String city) {

        if ((bloodGroup == null || bloodGroup.isBlank())
            && (city == null || city.isBlank())) {

            return userRepository.findAll();
        }

        if (bloodGroup == null || bloodGroup.isBlank()) {
            return userRepository.findByCity(city);
        }

        if (city == null || city.isBlank()) {
            return userRepository.findByBloodGroup(bloodGroup);
        }

        return userRepository.findByBloodGroupAndCity(bloodGroup, city);
    }


    
}
