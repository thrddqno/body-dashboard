package com.antonio.bodydashboard.service;

import java.time.LocalDate;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.dto.DailyLogResponse;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.exception.DailyLogNotFoundException;
import com.antonio.bodydashboard.exception.PersistenceConstraintViolation;
import com.antonio.bodydashboard.repository.DailyLogRepository;

@Service
public class DailyLogService {

	private final DailyLogRepository dailyLogRepository;
	private final DailyLogPersistenceService dailyLogPersistenceService;

	public DailyLogService(
			DailyLogRepository dailyLogRepository,
			DailyLogPersistenceService dailyLogPersistenceService) {
		this.dailyLogRepository = dailyLogRepository;
		this.dailyLogPersistenceService = dailyLogPersistenceService;
	}

	@Transactional(readOnly = true)
	public DailyLogResponse getByDate(LocalDate date) {
		return dailyLogRepository.findByDate(date)
				.map(this::toResponse)
				.orElseThrow(() -> new DailyLogNotFoundException(date));
	}

	public DailyLogResponse upsert(LocalDate date, DailyLogRequest request) {
		try {
			return toResponse(dailyLogPersistenceService.upsertInNewTransaction(date, request));
		} catch (DataIntegrityViolationException exception) {
			if (!PersistenceConstraintViolation.isConstraint(exception, "uq_daily_logs_date")) {
				throw exception;
			}
			return toResponse(dailyLogPersistenceService.upsertInNewTransaction(date, request));
		}
	}

	private DailyLogResponse toResponse(DailyLog dailyLog) {
		return new DailyLogResponse(
				dailyLog.getId(),
				dailyLog.getDate(),
				dailyLog.getSleepMinutes(),
				dailyLog.getSteps(),
				dailyLog.getEnergy(),
				dailyLog.getPainNotes(),
				dailyLog.getRecoveryNotes(),
				dailyLog.getEstimatedCalories(),
				dailyLog.getEstimatedProteinGrams(),
				dailyLog.getCreatedAt(),
				dailyLog.getUpdatedAt());
	}
}
