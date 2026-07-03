package com.cdweb.be.controller.admin;

import com.cdweb.be.dto.response.AdminBillDto;
import com.cdweb.be.entity.BillPayment;
import com.cdweb.be.entity.SplitBill;
import com.cdweb.be.entity.User;
import com.cdweb.be.repository.BillPaymentRepository;
import com.cdweb.be.repository.SplitBillRepository;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bills")
@Slf4j
public class AdminBillController extends AdminBaseController {

    private final SplitBillRepository splitBillRepository;
    private final BillPaymentRepository billPaymentRepository;

    public AdminBillController(UserRepository userRepository,
                               SplitBillRepository splitBillRepository,
                               BillPaymentRepository billPaymentRepository) {
        super(userRepository);
        this.splitBillRepository = splitBillRepository;
        this.billPaymentRepository = billPaymentRepository;
    }

    @GetMapping
    public ResponseEntity<Page<AdminBillDto>> getBills(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        requireAdminId(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<SplitBill> billsPage;
        if (status != null && !status.isBlank()) {
            try {
                com.cdweb.be.enums.BillStatus billStatus = com.cdweb.be.enums.BillStatus.valueOf(status.toUpperCase());
                billsPage = splitBillRepository.findByStatus(billStatus, pageable);
            } catch (IllegalArgumentException e) {
                billsPage = splitBillRepository.findAll(pageable);
            }
        } else {
            billsPage = splitBillRepository.findAll(pageable);
        }

        // Pre-fetch creator names in batch
        List<Integer> creatorIds = billsPage.getContent().stream()
                .map(SplitBill::getCreatedBy)
                .distinct()
                .collect(Collectors.toList());
        Map<Integer, String> creatorNames = userRepository.findAllById(creatorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        Page<AdminBillDto> dtoPage = billsPage.map(b -> AdminBillDto.builder()
                .id(b.getId())
                .roomId(b.getRoomId())
                .matchId(b.getMatchId())
                .creatorId(b.getCreatedBy())
                .creatorName(creatorNames.getOrDefault(b.getCreatedBy(), "User #" + b.getCreatedBy()))
                .title(b.getTitle())
                .totalAmount(b.getTotalAmount())
                .perPerson(b.getPerPerson())
                .participantCount(b.getParticipantCount())
                .bankCode(b.getBankCode())
                .accountNumber(b.getAccountNumber())
                .accountName(b.getAccountName())
                .status(b.getStatus().name())
                .createdAt(b.getCreatedAt())
                .closedAt(b.getClosedAt())
                .build());

        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<AdminBillDto.PaymentDetail>> getBillPayments(
            HttpServletRequest request,
            @PathVariable Integer id
    ) {
        requireAdminId(request);

        List<BillPayment> payments = billPaymentRepository.findByBillId(id);

        // Fetch user names in batch
        List<Integer> userIds = payments.stream().map(BillPayment::getUserId).distinct().collect(Collectors.toList());
        Map<Integer, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        List<AdminBillDto.PaymentDetail> details = payments.stream()
                .map(p -> AdminBillDto.PaymentDetail.builder()
                        .id(p.getId())
                        .userId(p.getUserId())
                        .userName(userNames.getOrDefault(p.getUserId(), "User #" + p.getUserId()))
                        .amount(p.getAmount())
                        .status(p.getStatus().name())
                        .scannedAt(p.getScannedAt())
                        .paidAt(p.getPaidAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(details);
    }
}
