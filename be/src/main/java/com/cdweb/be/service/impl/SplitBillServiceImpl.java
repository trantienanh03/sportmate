package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateSplitBillRequest;
import com.cdweb.be.dto.response.BillPaymentDto;
import com.cdweb.be.dto.response.MessageDto;
import com.cdweb.be.dto.response.SplitBillDto;
import com.cdweb.be.entity.*;
import com.cdweb.be.enums.BillStatus;
import com.cdweb.be.enums.MemberRole;
import com.cdweb.be.enums.MessageType;
import com.cdweb.be.enums.PaymentStatus;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.*;
import com.cdweb.be.service.SplitBillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SplitBillServiceImpl implements SplitBillService {

    private final SplitBillRepository splitBillRepository;
    private final BillPaymentRepository billPaymentRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public SplitBillDto createBill(CreateSplitBillRequest req, Integer hostId) {
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chat"));

        // Xác thực người tạo là Host của phòng chat
        RoomMember hostMember = roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(req.getRoomId(), hostId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng chat này"));
        if (hostMember.getRole() != MemberRole.HOST) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Host phòng mới được quyền tạo hóa đơn");
        }

        // Chỉ cho phép tối đa 1 hóa đơn ACTIVE trong mỗi phòng
        if (splitBillRepository.existsByRoomIdAndStatus(req.getRoomId(), BillStatus.ACTIVE)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đang có hóa đơn hoạt động trong phòng, vui lòng hoàn thành trước");
        }

        // Lấy danh sách thành viên hiện tại của room
        List<RoomMember> activeMembers = roomMemberRepository.findByRoomIdAndLeftAtIsNull(req.getRoomId());
        if (activeMembers.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phòng chat không có thành viên");
        }

        int memberCount = activeMembers.size();
        int perPerson = req.getTotalAmount() / memberCount;

        SplitBill bill = SplitBill.builder()
                .roomId(req.getRoomId())
                .matchId(room.getMatchId())
                .createdBy(hostId)
                .title(req.getTitle())
                .totalAmount(req.getTotalAmount())
                .perPerson(perPerson)
                .participantCount(memberCount)
                .bankCode(req.getBankCode())
                .accountNumber(req.getAccountNumber())
                .accountName(req.getAccountName())
                .note(req.getNote())
                .status(BillStatus.ACTIVE)
                .build();
        SplitBill savedBill = splitBillRepository.save(bill);

        // Tạo log thanh toán cho từng thành viên, tự động duyệt phần của Host
        List<BillPayment> payments = new ArrayList<>();
        for (RoomMember member : activeMembers) {
            boolean isCreator = member.getUserId().equals(hostId);
            BillPayment payment = BillPayment.builder()
                    .billId(savedBill.getId())
                    .userId(member.getUserId())
                    .amount(perPerson)
                    .status(isCreator ? PaymentStatus.PAID : PaymentStatus.PENDING)
                    .scannedAt(isCreator ? LocalDateTime.now() : null)
                    .paidAt(isCreator ? LocalDateTime.now() : null)
                    .confirmedBy(isCreator ? hostId : null)
                    .build();
            payments.add(payment);
        }
        List<BillPayment> savedPayments = billPaymentRepository.saveAll(payments);

        // Tạo tin nhắn thông báo trong chat nhóm
        Message message = Message.builder()
                .roomId(room.getId())
                .senderId(hostId)
                .type(MessageType.FEE_SPLIT)
                .content(req.getTitle())
                .metadata("{\"billId\":" + savedBill.getId() + "}")
                .build();
        Message savedMsg = messageRepository.save(message);

        // Cập nhật tin nhắn cuối của phòng
        room.setLastMessageAt(LocalDateTime.now());
        roomRepository.save(room);

        savedBill.setMessageId(savedMsg.getId());
        splitBillRepository.save(savedBill);

        // Broadcast tin nhắn realtime tới các thành viên qua WebSocket
        User sender = userRepository.findById(hostId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người gửi"));
        MessageDto msgDto = MessageDto.builder()
                .id(savedMsg.getId())
                .roomId(savedMsg.getRoomId())
                .senderId(hostId)
                .senderName(sender.getFullName())
                .senderAvatar(sender.getAvatarUrl())
                .type(savedMsg.getType().name())
                .content(savedMsg.getContent())
                .metadata(savedMsg.getMetadata())
                .createdAt(savedMsg.getCreatedAt())
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + room.getId(), msgDto);

        return mapToSplitBillDto(savedBill, savedPayments);
    }

    @Override
    @Transactional(readOnly = true)
    public SplitBillDto getBillDetail(Integer billId, Integer currentUserId) {
        SplitBill bill = splitBillRepository.findById(billId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));

        // Xác thực người xem là thành viên phòng
        roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(bill.getRoomId(), currentUserId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng chat này"));

        List<BillPayment> payments = billPaymentRepository.findByBillId(billId);
        return mapToSplitBillDto(bill, payments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SplitBillDto> getBillsByRoom(Integer roomId, Integer currentUserId) {
        // Xác thực người xem là thành viên phòng
        roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(roomId, currentUserId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng chat này"));

        List<SplitBill> bills = splitBillRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        return bills.stream().map(bill -> {
            List<BillPayment> payments = billPaymentRepository.findByBillId(bill.getId());
            return mapToSplitBillDto(bill, payments);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SplitBillDto markScanned(Integer billId, Integer userId) {
        SplitBill bill = splitBillRepository.findById(billId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));

        if (bill.getStatus() != BillStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn này đã hoàn thành hoặc đã đóng");
        }

        BillPayment payment = billPaymentRepository.findByBillIdAndUserId(billId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Bạn không nằm trong danh sách thanh toán của hóa đơn này"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Khoản thanh toán của bạn đã được xác nhận trước đó");
        }

        payment.setStatus(PaymentStatus.SCANNED);
        payment.setScannedAt(LocalDateTime.now());
        billPaymentRepository.save(payment);

        List<BillPayment> payments = billPaymentRepository.findByBillId(billId);
        return mapToSplitBillDto(bill, payments);
    }

    @Override
    @Transactional
    public SplitBillDto confirmPayment(Integer billId, Integer targetUserId, Integer hostId) {
        SplitBill bill = splitBillRepository.findById(billId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));

        if (bill.getStatus() != BillStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn này đã hoàn thành hoặc đã đóng");
        }

        // Chỉ Host của phòng mới được xác nhận thanh toán
        RoomMember hostMember = roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(bill.getRoomId(), hostId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng chat này"));
        if (hostMember.getRole() != MemberRole.HOST) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Host phòng mới được quyền xác nhận thanh toán");
        }

        BillPayment payment = billPaymentRepository.findByBillIdAndUserId(billId, targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Không tìm thấy lượt thanh toán của thành viên này"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Lượt thanh toán này đã được xác nhận trước đó");
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setConfirmedBy(hostId);
        if (payment.getScannedAt() == null) {
            payment.setScannedAt(LocalDateTime.now());
        }
        billPaymentRepository.save(payment);

        List<BillPayment> allPayments = billPaymentRepository.findByBillId(billId);

        // Kiểm tra xem tất cả đã thanh toán hết chưa để hoàn tất hóa đơn
        boolean allPaid = allPayments.stream().allMatch(p -> p.getStatus() == PaymentStatus.PAID);
        if (allPaid) {
            bill.setStatus(BillStatus.COMPLETED);
            bill.setClosedAt(LocalDateTime.now());
            splitBillRepository.save(bill);
        }

        return mapToSplitBillDto(bill, allPayments);
    }

    @Override
    @Transactional
    public SplitBillDto closeBill(Integer billId, Integer hostId) {
        SplitBill bill = splitBillRepository.findById(billId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn"));

        if (bill.getStatus() != BillStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hóa đơn này không ở trạng thái hoạt động");
        }

        // Chỉ Host của phòng mới được quyền đóng hóa đơn
        RoomMember hostMember = roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(bill.getRoomId(), hostId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "Bạn không ở trong phòng chat này"));
        if (hostMember.getRole() != MemberRole.HOST) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Host phòng mới được quyền đóng hóa đơn");
        }

        bill.setStatus(BillStatus.CLOSED);
        bill.setClosedAt(LocalDateTime.now());
        SplitBill savedBill = splitBillRepository.save(bill);

        List<BillPayment> payments = billPaymentRepository.findByBillId(billId);
        return mapToSplitBillDto(savedBill, payments);
    }

    private SplitBillDto mapToSplitBillDto(SplitBill bill, List<BillPayment> payments) {
        int paidCount = (int) payments.stream().filter(p -> p.getStatus() == PaymentStatus.PAID).count();
        int scannedCount = (int) payments.stream().filter(p -> p.getStatus() == PaymentStatus.SCANNED).count();

        List<Integer> userIds = payments.stream().map(BillPayment::getUserId).collect(Collectors.toList());
        List<User> users = userRepository.findAllById(userIds);
        Map<Integer, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));

        List<BillPaymentDto> paymentDtos = payments.stream().map(p -> {
            User user = userMap.get(p.getUserId());
            return BillPaymentDto.builder()
                    .id(p.getId())
                    .billId(p.getBillId())
                    .userId(p.getUserId())
                    .userName(user != null ? user.getFullName() : "Người dùng")
                    .userAvatar(user != null ? user.getAvatarUrl() : null)
                    .amount(p.getAmount())
                    .status(p.getStatus())
                    .scannedAt(p.getScannedAt())
                    .paidAt(p.getPaidAt())
                    .confirmedBy(p.getConfirmedBy())
                    .build();
        }).collect(Collectors.toList());

        return SplitBillDto.builder()
                .id(bill.getId())
                .roomId(bill.getRoomId())
                .matchId(bill.getMatchId())
                .createdBy(bill.getCreatedBy())
                .title(bill.getTitle())
                .totalAmount(bill.getTotalAmount())
                .perPerson(bill.getPerPerson())
                .participantCount(bill.getParticipantCount())
                .bankCode(bill.getBankCode())
                .accountNumber(bill.getAccountNumber())
                .accountName(bill.getAccountName())
                .note(bill.getNote())
                .status(bill.getStatus())
                .paidCount(paidCount)
                .scannedCount(scannedCount)
                .messageId(bill.getMessageId())
                .createdAt(bill.getCreatedAt())
                .closedAt(bill.getClosedAt())
                .payments(paymentDtos)
                .build();
    }
}
