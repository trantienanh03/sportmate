package com.cdweb.be.controller;

import com.cdweb.be.dto.request.CreateSplitBillRequest;
import com.cdweb.be.dto.response.SplitBillDto;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.service.SplitBillService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SplitBillController {

    private final SplitBillService splitBillService;

    private Integer requireUserId(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        return (Integer) session.getAttribute("userId");
    }

    @PostMapping("/split-bills")
    public ResponseEntity<SplitBillDto> createBill(@Valid @RequestBody CreateSplitBillRequest request, HttpServletRequest req) {
        Integer hostId = requireUserId(req);
        SplitBillDto response = splitBillService.createBill(request, hostId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/split-bills/{billId}")
    public ResponseEntity<SplitBillDto> getBillDetail(@PathVariable Integer billId, HttpServletRequest req) {
        Integer userId = requireUserId(req);
        SplitBillDto response = splitBillService.getBillDetail(billId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rooms/{roomId}/split-bills")
    public ResponseEntity<List<SplitBillDto>> getBillsByRoom(@PathVariable Integer roomId, HttpServletRequest req) {
        Integer userId = requireUserId(req);
        List<SplitBillDto> response = splitBillService.getBillsByRoom(roomId, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/split-bills/{billId}/mark-scanned")
    public ResponseEntity<SplitBillDto> markScanned(@PathVariable Integer billId, HttpServletRequest req) {
        Integer userId = requireUserId(req);
        SplitBillDto response = splitBillService.markScanned(billId, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/split-bills/{billId}/payments/{userId}/confirm")
    public ResponseEntity<SplitBillDto> confirmPayment(
            @PathVariable Integer billId,
            @PathVariable Integer userId,
            HttpServletRequest req) {
        Integer hostId = requireUserId(req);
        SplitBillDto response = splitBillService.confirmPayment(billId, userId, hostId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/split-bills/{billId}/close")
    public ResponseEntity<SplitBillDto> closeBill(@PathVariable Integer billId, HttpServletRequest req) {
        Integer hostId = requireUserId(req);
        SplitBillDto response = splitBillService.closeBill(billId, hostId);
        return ResponseEntity.ok(response);
    }
}
