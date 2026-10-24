package com.bloodDonar.DTO;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationDetailsDTO {

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Gender is required")
    @Pattern(
        regexp = "(?i)male|female|other",
        message = "Gender must be Male, Female, or Other"
    )
    private String gender;

    @NotNull
    @DecimalMin("-90.0")
    @DecimalMax("90.0")
    private Double latitude;

    @NotNull
    @DecimalMin("-180.0")
    @DecimalMax("180.0")
    private Double longitude;
}
