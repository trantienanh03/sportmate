package com.cdweb.be.repository;

import com.cdweb.be.entity.BillPayment;
import com.cdweb.be.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillPaymentRepository extends JpaRepository<BillPayment, Integer> {

    List<BillPayment> findByBillId(Integer billId);

    Optional<BillPayment> findByBillIdAndUserId(Integer billId, Integer userId);

    long countByBillIdAndStatus(Integer billId, PaymentStatus status);

    List<BillPayment> findByBillIdAndStatus(Integer billId, PaymentStatus status);
}
