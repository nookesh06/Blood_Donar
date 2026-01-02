package com.bloodDonar.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bloodDonar.Entity.BloodDonarEntity;

public interface UserRepository extends JpaRepository<BloodDonarEntity, Integer> {

    Optional<BloodDonarEntity> findByEmailId(String emailId);

    List<BloodDonarEntity> findByBloodGroupAndCity(String bloodGroup, String city);
    List<BloodDonarEntity> findByCity(String city);
    List<BloodDonarEntity> findByBloodGroup(String bloodGroup);


}
