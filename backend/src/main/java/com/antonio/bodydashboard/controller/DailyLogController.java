package com.antonio.bodydashboard.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.dto.DailyLogResponse;
import com.antonio.bodydashboard.service.DailyLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/daily-logs")
public class DailyLogController {

	private final DailyLogService dailyLogService;

	public DailyLogController(DailyLogService dailyLogService) {
		this.dailyLogService = dailyLogService;
	}

	@GetMapping("/{date}")
	public DailyLogResponse findDailyLog(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return dailyLogService.getByDate(date);
	}

	@PutMapping("/{date}")
	public DailyLogResponse saveDailyLog(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@Valid @RequestBody DailyLogRequest request) {
		return dailyLogService.upsert(date, request);
	}
}
