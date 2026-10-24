package com.bloodDonar.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
	@NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
private String emailId;
	@Size(min = 6,message = "Enter valid password")
	@NotBlank
private String password;

}
