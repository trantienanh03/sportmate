package com.cdweb.be.config;

import com.cdweb.be.entity.Sport;
import com.cdweb.be.entity.User;
import com.cdweb.be.enums.UserRole;
import com.cdweb.be.repository.SportRepository;
import com.cdweb.be.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@sportmate.com")) {
                User admin = User.builder()
                        .fullName("Admin SportMate")
                        .email("admin@sportmate.com")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .role(UserRole.admin)
                        .district("Thủ Đức")
                        .isActive(true)
                        .isBanned(false)
                        .build();
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@sportmate.com / admin123");
            }
            if (!userRepository.existsByEmail("user@sportmate.com")) {
                User user = User.builder()
                        .fullName("Trần Tiến Anh")
                        .email("user@sportmate.com")
                        .passwordHash(passwordEncoder.encode("user123"))
                        .role(UserRole.user)
                        .district("Thủ Đức")
                        .isActive(true)
                        .isBanned(false)
                        .build();
                userRepository.save(user);
                System.out.println("Default regular user created: user@sportmate.com / user123");
            }
        };
    }
}
