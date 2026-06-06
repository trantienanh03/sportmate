package com.cdweb.be.controller;

import com.cdweb.be.entity.Sport;
import com.cdweb.be.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
public class SportController {

    private final SportRepository sportRepository;

    @GetMapping
    public ResponseEntity<List<Sport>> getActiveSports() {
        return ResponseEntity.ok(sportRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }
}
