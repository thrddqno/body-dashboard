package com.antonio.bodydashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.repository.DailyLogRepository;

class DailyLogServiceTest {

	@Test
	void retriesAfterConcurrentFirstInsertConflict() {
		LocalDate date = LocalDate.of(2026, 8, 30);
		DailyLogRequest request = request();
		DailyLogPersistenceService persistenceService = mock(DailyLogPersistenceService.class);
		ConstraintViolationException constraint = mock(ConstraintViolationException.class);
		when(constraint.getConstraintName()).thenReturn("uq_daily_logs_date");
		DailyLog saved = new DailyLog();
		saved.setId(1L);
		saved.setDate(date);
		saved.setSteps(8000);
		when(persistenceService.upsertInNewTransaction(date, request))
				.thenThrow(new DataIntegrityViolationException("duplicate", constraint))
				.thenReturn(saved);
		DailyLogService service = new DailyLogService(mock(DailyLogRepository.class), persistenceService);

		assertThat(service.upsert(date, request).id()).isEqualTo(1L);
		verify(persistenceService, org.mockito.Mockito.times(2)).upsertInNewTransaction(date, request);
	}

	@Test
	void doesNotRetryUnrelatedIntegrityFailure() {
		LocalDate date = LocalDate.of(2026, 8, 30);
		DailyLogRequest request = request();
		DailyLogPersistenceService persistenceService = mock(DailyLogPersistenceService.class);
		DataIntegrityViolationException failure = new DataIntegrityViolationException("other failure");
		when(persistenceService.upsertInNewTransaction(date, request)).thenThrow(failure);
		DailyLogService service = new DailyLogService(mock(DailyLogRepository.class), persistenceService);

		assertThatThrownBy(() -> service.upsert(date, request)).isSameAs(failure);
		verify(persistenceService).upsertInNewTransaction(date, request);
	}

	private DailyLogRequest request() {
		return new DailyLogRequest(420, 8000, EnergyLevel.HIGH, null, null, 2200, 140);
	}
}
