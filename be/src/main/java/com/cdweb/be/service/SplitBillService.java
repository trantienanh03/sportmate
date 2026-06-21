package com.cdweb.be.service;

import com.cdweb.be.dto.request.CreateSplitBillRequest;
import com.cdweb.be.dto.response.SplitBillDto;

import java.util.List;

public interface SplitBillService {

    SplitBillDto createBill(CreateSplitBillRequest req, Integer hostId);

    SplitBillDto getBillDetail(Integer billId, Integer currentUserId);

    List<SplitBillDto> getBillsByRoom(Integer roomId, Integer currentUserId);

    SplitBillDto markScanned(Integer billId, Integer userId);

    SplitBillDto confirmPayment(Integer billId, Integer targetUserId, Integer hostId);

    SplitBillDto closeBill(Integer billId, Integer hostId);
}
