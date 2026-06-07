package com.cdweb.be.repository;

import com.cdweb.be.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Integer> {
    Optional<Sport> findBySlug(String slug);
    List<Sport> findByIsActiveTrueOrderByDisplayOrderAsc();
}
