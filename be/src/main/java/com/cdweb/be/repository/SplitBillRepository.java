package com.cdweb.be.repository;

import com.cdweb.be.entity.SplitBill;
import com.cdweb.be.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SplitBillRepository extends JpaRepository<SplitBill, Integer> {

    List<SplitBill> findByRoomIdOrderByCreatedAtDesc(Integer roomId);

    Optional<SplitBill> findByRoomIdAndStatus(Integer roomId, BillStatus status);

    boolean existsByRoomIdAndStatus(Integer roomId, BillStatus status);
}
