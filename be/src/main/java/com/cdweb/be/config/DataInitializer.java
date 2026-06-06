package com.cdweb.be.config;

import com.cdweb.be.entity.Sport;
import com.cdweb.be.repository.SportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initSports(SportRepository sportRepository) {
        return args -> {
            if (sportRepository.count() == 0) {
                System.out.println("No sports found in the database. Initializing default sports...");
                Sport football = new Sport();
                football.setName("Bóng đá");
                football.setSlug("bong-da");
                football.setDisplayOrder((short) 1);
                football.setIsActive(true);

                Sport badminton = new Sport();
                badminton.setName("Cầu lông");
                badminton.setSlug("cau-long");
                badminton.setDisplayOrder((short) 2);
                badminton.setIsActive(true);

                Sport basketball = new Sport();
                basketball.setName("Bóng rổ");
                basketball.setSlug("bong-ro");
                basketball.setDisplayOrder((short) 3);
                basketball.setIsActive(true);

                Sport tennis = new Sport();
                tennis.setName("Tennis");
                tennis.setSlug("tennis");
                tennis.setDisplayOrder((short) 4);
                tennis.setIsActive(true);
                
                Sport tableTennis = new Sport();
                tableTennis.setName("Bóng bàn");
                tableTennis.setSlug("bong-ban");
                tableTennis.setDisplayOrder((short) 5);
                tableTennis.setIsActive(true);

                sportRepository.saveAll(List.of(football, badminton, basketball, tennis, tableTennis));
                System.out.println("Default sports have been successfully inserted.");
            }
        };
    }
}
