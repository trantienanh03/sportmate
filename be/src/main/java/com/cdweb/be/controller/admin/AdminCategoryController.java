package com.cdweb.be.controller.admin;

import com.cdweb.be.entity.Sport;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.SportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@Slf4j
public class AdminCategoryController extends AdminBaseController {

    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;

    public AdminCategoryController(UserRepository userRepository, SportRepository sportRepository, VenueRepository venueRepository) {
        super(userRepository);
        this.sportRepository = sportRepository;
        this.venueRepository = venueRepository;
    }

    // ── GET all ──────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCategories(HttpServletRequest request) {
        requireAdminId(request);
        List<Sport> sports = sportRepository.findAll();
        List<Venue> venues = venueRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("sports", sports);
        response.put("venues", venues);
        return ResponseEntity.ok(response);
    }

    // ── SPORTS CRUD ───────────────────────────────────────────────────────────

    @PostMapping("/sports")
    @Transactional
    public ResponseEntity<Sport> createSport(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        requireAdminId(request);
        String name = (String) body.get("name");
        String slug = (String) body.get("slug");
        if (name == null || name.isBlank()) throw new AppException(HttpStatus.BAD_REQUEST, "Tên môn thể thao không được để trống");
        if (slug == null || slug.isBlank()) throw new AppException(HttpStatus.BAD_REQUEST, "Slug không được để trống");

        Sport sport = Sport.builder()
                .name(name.trim())
                .slug(slug.trim().toLowerCase())
                .iconUrl((String) body.get("iconUrl"))
                .displayOrder(body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).shortValue() : null)
                .isActive(body.get("isActive") == null || (Boolean) body.get("isActive"))
                .build();
        Sport saved = sportRepository.save(sport);
        log.info("Admin created sport: {}", saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/sports/{id}")
    @Transactional
    public ResponseEntity<Sport> updateSport(HttpServletRequest request, @PathVariable Integer id, @RequestBody Map<String, Object> body) {
        requireAdminId(request);
        Sport sport = sportRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy môn thể thao"));

        if (body.containsKey("name") && body.get("name") != null) sport.setName(((String) body.get("name")).trim());
        if (body.containsKey("slug") && body.get("slug") != null) sport.setSlug(((String) body.get("slug")).trim().toLowerCase());
        if (body.containsKey("iconUrl")) sport.setIconUrl((String) body.get("iconUrl"));
        if (body.containsKey("displayOrder") && body.get("displayOrder") != null) sport.setDisplayOrder(((Number) body.get("displayOrder")).shortValue());
        if (body.containsKey("isActive") && body.get("isActive") != null) sport.setIsActive((Boolean) body.get("isActive"));

        Sport saved = sportRepository.save(sport);
        log.info("Admin updated sport id: {}", id);
        return ResponseEntity.ok(saved);
    }

    // ── VENUES CRUD ───────────────────────────────────────────────────────────

    @PostMapping("/venues")
    @Transactional
    public ResponseEntity<Venue> createVenue(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        requireAdminId(request);
        String name = (String) body.get("name");
        if (name == null || name.isBlank()) throw new AppException(HttpStatus.BAD_REQUEST, "Tên sân không được để trống");

        Venue venue = Venue.builder()
                .name(name.trim())
                .address((String) body.get("address"))
                .district((String) body.get("district"))
                .lat(body.get("lat") != null ? ((Number) body.get("lat")).doubleValue() : null)
                .lng(body.get("lng") != null ? ((Number) body.get("lng")).doubleValue() : null)
                .googleMapsUrl((String) body.get("googleMapsUrl"))
                .verified(Boolean.TRUE.equals(body.get("verified")))
                .build();
        Venue saved = venueRepository.save(venue);
        log.info("Admin created venue: {}", saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/venues/{id}")
    @Transactional
    public ResponseEntity<Venue> updateVenue(HttpServletRequest request, @PathVariable Integer id, @RequestBody Map<String, Object> body) {
        requireAdminId(request);
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sân"));

        if (body.containsKey("name") && body.get("name") != null) venue.setName(((String) body.get("name")).trim());
        if (body.containsKey("address")) venue.setAddress((String) body.get("address"));
        if (body.containsKey("district")) venue.setDistrict((String) body.get("district"));
        if (body.containsKey("lat") && body.get("lat") != null) venue.setLat(((Number) body.get("lat")).doubleValue());
        if (body.containsKey("lng") && body.get("lng") != null) venue.setLng(((Number) body.get("lng")).doubleValue());
        if (body.containsKey("googleMapsUrl")) venue.setGoogleMapsUrl((String) body.get("googleMapsUrl"));
        if (body.containsKey("verified") && body.get("verified") != null) venue.setVerified((Boolean) body.get("verified"));

        Venue saved = venueRepository.save(venue);
        log.info("Admin updated venue id: {}", id);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/venues/{id}/toggle-visibility")
    @Transactional
    public ResponseEntity<String> toggleVenueVisibility(HttpServletRequest request, @PathVariable Integer id) {
        requireAdminId(request);
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy sân"));
        venue.setVerified(!venue.getVerified());
        venueRepository.save(venue);
        String action = venue.getVerified() ? "hiện" : "ẩn";
        return ResponseEntity.ok("Đã " + action + " sân: " + venue.getName());
    }
}
