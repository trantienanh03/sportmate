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
                football.setSlug("football");
                football.setDisplayOrder((short) 1);
                football.setIsActive(true);

                Sport badminton = new Sport();
                badminton.setName("Cầu lông");
                badminton.setSlug("badminton");
                badminton.setDisplayOrder((short) 2);
                badminton.setIsActive(true);

                Sport basketball = new Sport();
                basketball.setName("Bóng rổ");
                basketball.setSlug("basketball");
                basketball.setDisplayOrder((short) 3);
                basketball.setIsActive(true);

                Sport tennis = new Sport();
                tennis.setName("Tennis");
                tennis.setSlug("tennis");
                tennis.setDisplayOrder((short) 4);
                tennis.setIsActive(true);
                
                Sport tableTennis = new Sport();
                tableTennis.setName("Bóng bàn");
                tableTennis.setSlug("tabletennis");
                tableTennis.setDisplayOrder((short) 5);
                tableTennis.setIsActive(true);

                Sport pickleball = new Sport();
                pickleball.setName("Pickleball");
                pickleball.setSlug("pickleball");
                pickleball.setDisplayOrder((short) 6);
                pickleball.setIsActive(true);

                Sport esports = new Sport();
                esports.setName("Thể thao điện tử");
                esports.setSlug("esports");
                esports.setDisplayOrder((short) 7);
                esports.setIsActive(true);

                Sport volleyball = new Sport();
                volleyball.setName("Bóng chuyền");
                volleyball.setSlug("volleyball");
                volleyball.setDisplayOrder((short) 8);
                volleyball.setIsActive(true);

                sportRepository.saveAll(List.of(football, badminton, basketball, tennis, tableTennis, pickleball, esports, volleyball));
                System.out.println("Default sports have been successfully inserted.");
            }
        };
    }
}
