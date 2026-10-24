package com.bloodDonar.DTO;

import java.time.LocalDate;

import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50)
    private String userName;

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String emailId;

    @NotNull(message = "Mobile number is required")
    @Digits(integer = 10, fraction = 0, message = "Mobile number must be 10 digits")
    private Long mobileNumber;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

   
}
