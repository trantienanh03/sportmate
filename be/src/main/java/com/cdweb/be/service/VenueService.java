package com.cdweb.be.service;

import com.cdweb.be.dto.response.VenueDto;
import java.util.List;

public interface VenueService {
    List<VenueDto> getAllVenues(String sport);
}
