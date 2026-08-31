package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.repository.DailyLogRepository;

@Service
public class RecoveryAnalyticsService {

	private static final int RECOVERY_WINDOW_DAYS = 7;

	private final Clock clock;
	private final DailyLogRepository dailyLogRepository;

	public RecoveryAnalyticsService(Clock clock, DailyLogRepository dailyLogRepository) {
		this.clock = clock;
		this.dailyLogRepository = dailyLogRepository;
	}

	@Transactional(readOnly = true)
	public RecoveryAnalyticsSummary summarizeCurrentSevenDayWindow() {
		return summarizeLastSevenDays(LocalDate.now(clock));
	}

	@Transactional(readOnly = true)
	public RecoveryAnalyticsSummary summarizeLastSevenDays(LocalDate periodEnd) {
		LocalDate periodStart = periodEnd.minusDays(RECOVERY_WINDOW_DAYS - 1L);
		return summarize(periodStart, periodEnd, dailyLogRepository.findByDateBetweenOrderByDateAsc(periodStart, periodEnd));
	}

	public RecoveryAnalyticsSummary summarize(LocalDate periodStart, LocalDate periodEnd, List<DailyLog> logs) {
		List<DailyLog> logsInPeriod = nullSafe(logs).stream()
				.filter(log -> !log.getDate().isBefore(periodStart) && !log.getDate().isAfter(periodEnd))
				.toList();

		return new RecoveryAnalyticsSummary(
				periodStart,
				periodEnd,
				averageSleepMinutes(logsInPeriod),
				averageSteps(logsInPeriod),
				logsInPeriod.stream().filter(log -> log.getEnergy() != null).count());
	}

	private Optional<BigDecimal> averageSleepMinutes(List<DailyLog> logs) {
		List<Integer> sleepValues = logs.stream()
				.map(DailyLog::getSleepMinutes)
				.filter(value -> value != null)
				.toList();
		if (sleepValues.isEmpty()) {
			return Optional.empty();
		}

		BigDecimal total = sleepValues.stream()
				.map(BigDecimal::valueOf)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		return Optional.of(total.divide(BigDecimal.valueOf(sleepValues.size()), 2, RoundingMode.HALF_UP));
	}

	private Optional<Integer> averageSteps(List<DailyLog> logs) {
		List<Integer> stepValues = logs.stream()
				.map(DailyLog::getSteps)
				.filter(value -> value != null)
				.toList();
		if (stepValues.isEmpty()) {
			return Optional.empty();
		}

		BigDecimal total = stepValues.stream()
				.map(BigDecimal::valueOf)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		return Optional.of(total.divide(BigDecimal.valueOf(stepValues.size()), 0, RoundingMode.HALF_UP).intValueExact());
	}

	private List<DailyLog> nullSafe(List<DailyLog> logs) {
		return logs == null ? List.of() : logs;
	}
}
