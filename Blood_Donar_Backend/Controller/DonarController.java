package com.bloodDonar.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bloodDonar.DTO.LocationDetailsDTO;
import com.bloodDonar.DTO.LoginDTO;
import com.bloodDonar.DTO.RegistrationDTO;
import com.bloodDonar.Entity.BloodDonarEntity;
import com.bloodDonar.Service.UserService;
import com.bloodDonar.DTO.ProfileDTO;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(origins = "*")
public class DonarController {

    @Autowired
    private UserService userService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<String> registerDonor(
            @Valid @RequestBody RegistrationDTO dto) {
        return userService.DonarRegistration(dto);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginDTO dto) {
        return userService.login(dto);
    }
    
    //=============SignUP=====================
    

    // ================= LOCATION =================
    @PostMapping("/location-details")
    public ResponseEntity<String> saveLocation(
            @RequestParam String emailId,
            @Valid @RequestBody LocationDetailsDTO dto) {

        return userService.saveLocation(emailId, dto);
    }


    // ================= SEARCH =================
    @GetMapping("/search")
    public ResponseEntity<List<BloodDonarEntity>> searchDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city) {

        return ResponseEntity.ok(
                userService.getDonors(bloodGroup, city)
        );
    }
    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile(
            @RequestParam String emailId) {

        return ResponseEntity.ok(userService.getProfile(emailId));
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestParam String emailId,
            @RequestBody ProfileDTO dto) {

        return userService.updateProfile(emailId, dto);
    }

    @GetMapping("/")
    public String home() {
        return "redirect:/home_page.html";
    }

    
}



