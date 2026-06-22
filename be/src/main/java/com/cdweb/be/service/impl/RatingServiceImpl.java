package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.RatingItemDto;
import com.cdweb.be.dto.request.RatingRequestDto;
import com.cdweb.be.entity.*;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.*;
import com.cdweb.be.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final MatchRatingRepository matchRatingRepository;
    private final UserStatRepository userStatRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    @Override
    @Transactional
    public void submitBatchRatings(Integer raterId, RatingRequestDto request) {
        User rater = userRepository.findById(raterId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Rater not found"));

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (match.getStatus() != MatchStatus.completed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể đánh giá khi trận đấu đã hoàn tất");
        }

        List<MatchRating> existingRatings = matchRatingRepository.findByMatchIdAndRaterId(match.getId(), raterId);
        List<Integer> alreadyRatedIds = existingRatings.stream()
                .map(r -> r.getRatee().getId())
                .collect(Collectors.toList());

        for (RatingItemDto item : request.getRatings()) {
            if (item.getRateeId().equals(raterId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể tự đánh giá bản thân");
            }

            User ratee = userRepository.findById(item.getRateeId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Ratee not found"));

            if (alreadyRatedIds.contains(item.getRateeId())) {
                MatchRating existing = existingRatings.stream()
                        .filter(r -> r.getRatee().getId().equals(item.getRateeId()))
                        .findFirst()
                        .orElseThrow();
                existing.setSkillScore(item.getSkillScore());
                existing.setAttitudeScore(item.getAttitudeScore());
                existing.setComment(item.getComment());
                matchRatingRepository.save(existing);
                updateUserStats(ratee);
                continue; // Skip creating a new one
            }

            MatchRating newRating = MatchRating.builder()
                    .match(match)
                    .rater(rater)
                    .ratee(ratee)
                    .skillScore(item.getSkillScore())
                    .attitudeScore(item.getAttitudeScore())
                    .comment(item.getComment())
                    .build();

            matchRatingRepository.save(newRating);

            updateUserStats(ratee);
        }
    }

    private void updateUserStats(User user) {
        UserStat stat = userStatRepository.findByUserId(user.getId())
                .orElseGet(() -> UserStat.builder().user(user).build());

        List<Object[]> stats = matchRatingRepository.getRatingStatsByRateeId(user.getId());
        
        if (stats.isEmpty() || stats.get(0)[0] == null || ((Number) stats.get(0)[0]).longValue() == 0) return;

        Object[] row = stats.get(0);
        long count = ((Number) row[0]).longValue();
        double avgSkill = ((Number) row[1]).doubleValue();
        double avgAttitude = ((Number) row[2]).doubleValue();

        stat.setTotalRatings((int) count);
        stat.setAvgSkillScore(avgSkill);
        stat.setAvgAttitudeScore(avgAttitude);
        // For completed matches count, we can derive it or keep it simple
        
        userStatRepository.save(stat);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getUnratedParticipantIds(Integer userId, Integer matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (match.getStatus() != MatchStatus.completed) {
            return new ArrayList<>(); // Not completed, nothing to rate
        }

        // Get all participants
        List<Integer> participantIds = matchParticipantRepository.findByMatch_Id(matchId).stream()
                .map(p -> p.getUser().getId())
                .collect(Collectors.toList());
        
        // Ensure host is included (if host is not in participants table for some reason)
        if (!participantIds.contains(match.getHost().getId())) {
            participantIds.add(match.getHost().getId());
        }

        // Exclude current user
        participantIds.remove(userId);

        // Get already rated
        List<Integer> ratedIds = matchRatingRepository.findByMatchIdAndRaterId(matchId, userId).stream()
                .map(r -> r.getRatee().getId())
                .collect(Collectors.toList());

        participantIds.removeAll(ratedIds);

        return participantIds;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingItemDto> getMyRatings(Integer userId, Integer matchId) {
        return matchRatingRepository.findByMatchIdAndRaterId(matchId, userId).stream()
                .map(r -> {
                    RatingItemDto dto = new RatingItemDto();
                    dto.setRateeId(r.getRatee().getId());
                    dto.setSkillScore(r.getSkillScore());
                    dto.setAttitudeScore(r.getAttitudeScore());
                    dto.setComment(r.getComment());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
