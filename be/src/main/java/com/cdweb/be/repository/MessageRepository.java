package com.cdweb.be.repository;

import com.cdweb.be.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByRoomIdAndDeletedAtIsNullOrderByIdDesc(Integer roomId, Pageable pageable);

    List<Message> findByRoomIdAndIdLessThanAndDeletedAtIsNullOrderByIdDesc(Integer roomId, Long beforeId, Pageable pageable);
}
