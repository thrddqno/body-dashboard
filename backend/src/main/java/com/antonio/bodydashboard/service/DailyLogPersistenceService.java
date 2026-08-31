package com.antonio.bodydashboard.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.repository.DailyLogRepository;

@Service
class DailyLogPersistenceService {

	private final DailyLogRepository dailyLogRepository;

	DailyLogPersistenceService(DailyLogRepository dailyLogRepository) {
		this.dailyLogRepository = dailyLogRepository;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	DailyLog upsertInNewTransaction(LocalDate date, DailyLogRequest request) {
		DailyLog dailyLog = dailyLogRepository.findByDate(date)
				.orElseGet(DailyLog::new);

		dailyLog.setDate(date);
		dailyLog.setSleepMinutes(request.sleepMinutes());
		dailyLog.setSteps(request.steps());
		dailyLog.setEnergy(request.energy());
		dailyLog.setPainNotes(request.painNotes());
		dailyLog.setRecoveryNotes(request.recoveryNotes());
		dailyLog.setEstimatedCalories(request.estimatedCalories());
		dailyLog.setEstimatedProteinGrams(request.estimatedProteinGrams());

		return dailyLogRepository.saveAndFlush(dailyLog);
	}
}
