package com.bloodDonar.DAO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.bloodDonar.Entity.BloodDonarEntity;
import com.bloodDonar.repo.UserRepository;
@Repository
public class DonarDAO {
	@Autowired
UserRepository userRepository;
	public BloodDonarEntity insertDonarDetails(BloodDonarEntity bloodDonarEntity)
	{
		return userRepository.save(bloodDonarEntity);
	}
	
}
