package com.cdweb.be.controller;

import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueDto>> getAllVenues(
            @RequestParam(required = false) String sport) {
        return ResponseEntity.ok(venueService.getAllVenues(sport));
    }
}
