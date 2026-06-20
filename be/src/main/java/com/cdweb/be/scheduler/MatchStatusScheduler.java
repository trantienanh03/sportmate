package com.cdweb.be.scheduler;

import com.cdweb.be.entity.Match;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchStatusScheduler {

    private final MatchRepository matchRepository;

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void autoCompleteMatches() {
        LocalDateTime now = LocalDateTime.now();
        List<MatchStatus> statuses = java.util.Arrays.asList(MatchStatus.open, MatchStatus.full);
        List<Match> matchesToComplete = matchRepository.findByStatusInAndEndTimeBefore(statuses, now);
        
        if (!matchesToComplete.isEmpty()) {
            for (Match match : matchesToComplete) {
                match.setStatus(MatchStatus.completed);
            }
            matchRepository.saveAll(matchesToComplete);
            log.info("Auto-completed {} matches", matchesToComplete.size());
        }
    }
}
