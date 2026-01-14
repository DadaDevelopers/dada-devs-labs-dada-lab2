package com.dada_labs_two.chamavault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Enable Spring's scheduled task execution
public class ChamavaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChamavaultApplication.class, args);
	}

}
