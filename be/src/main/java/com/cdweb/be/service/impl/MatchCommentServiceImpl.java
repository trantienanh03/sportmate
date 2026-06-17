package com.cdweb.be.service.impl;

import com.cdweb.be.dto.MatchCommentDto;
import com.cdweb.be.dto.request.MatchCommentRequestDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchComment;
import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import org.springframework.http.HttpStatus;
import com.cdweb.be.repository.MatchCommentRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.MatchCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchCommentServiceImpl implements MatchCommentService {

    private final MatchCommentRepository matchCommentRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MatchCommentDto> getCommentsByMatchId(Integer matchId) {
        if (!matchRepository.existsById(matchId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Match not found with id " + matchId);
        }
        List<MatchComment> comments = matchCommentRepository.findByMatchIdOrderByCreatedAtDesc(matchId);
        return comments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MatchCommentDto addComment(Integer userId, MatchCommentRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found with id " + userId));

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found with id " + request.getMatchId()));

        MatchComment comment = MatchComment.builder()
                .match(match)
                .user(user)
                .content(request.getContent())
                .build();

        MatchComment savedComment = matchCommentRepository.save(comment);
        return mapToDto(savedComment);
    }

    @Override
    @Transactional
    public MatchCommentDto updateComment(Integer userId, Long commentId, MatchCommentRequestDto request) {
        MatchComment comment = matchCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found with id " + commentId));
                
        if (!comment.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to edit this comment");
        }
        
        comment.setContent(request.getContent());
        MatchComment updatedComment = matchCommentRepository.save(comment);
        return mapToDto(updatedComment);
    }

    @Override
    @Transactional
    public void deleteComment(Integer userId, Long commentId) {
        MatchComment comment = matchCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found with id " + commentId));
                
        // Only the author can delete the comment (in real app, admin could too)
        if (!comment.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
        }
        
        matchCommentRepository.delete(comment);
    }

    private MatchCommentDto mapToDto(MatchComment comment) {
        return MatchCommentDto.builder()
                .id(comment.getId())
                .matchId(comment.getMatch().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
