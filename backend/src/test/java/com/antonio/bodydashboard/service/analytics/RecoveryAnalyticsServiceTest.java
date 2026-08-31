package com.antonio.bodydashboard.service.analytics;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.EnergyLevel;

class RecoveryAnalyticsServiceTest {

	private final RecoveryAnalyticsService service = new RecoveryAnalyticsService(Clock.systemUTC(), null);

	@Test
	void calculatesAverageSleepStepsAndReportedEnergyCountForSevenDayWindow() {
		LocalDate periodEnd = LocalDate.of(2026, 8, 31);
		LocalDate periodStart = periodEnd.minusDays(6);

		RecoveryAnalyticsSummary summary = service.summarize(periodStart, periodEnd, List.of(
				log(periodStart.minusDays(1), 600, 20_000, EnergyLevel.HIGH),
				log(periodStart, 420, 8_000, EnergyLevel.AVERAGE),
				log(periodStart.plusDays(2), 480, null, null),
				log(periodEnd, null, 10_001, EnergyLevel.LOW),
				log(periodEnd.plusDays(1), 60, 1, EnergyLevel.VERY_LOW)));

		assertThat(summary.periodStart()).isEqualTo(periodStart);
		assertThat(summary.periodEnd()).isEqualTo(periodEnd);
		assertThat(summary.averageSleepMinutes()).hasValueSatisfying(value -> assertThat(value).isEqualByComparingTo("450.00"));
		assertThat(summary.averageSteps()).contains(9001);
		assertThat(summary.daysWithReportedEnergy()).isEqualTo(2);
	}

	@Test
	void ignoresMissingSleepAndStepValuesWithoutInventingAverages() {
		LocalDate periodEnd = LocalDate.of(2026, 8, 31);
		LocalDate periodStart = periodEnd.minusDays(6);

		RecoveryAnalyticsSummary summary = service.summarize(periodStart, periodEnd, List.of(
				log(periodStart, null, null, null),
				log(periodEnd, null, null, EnergyLevel.HIGH)));

		assertThat(summary.averageSleepMinutes()).isEmpty();
		assertThat(summary.averageSteps()).isEmpty();
		assertThat(summary.daysWithReportedEnergy()).isEqualTo(1);
	}

	@Test
	void returnsEmptyAveragesForSparsePeriodWithNoLogs() {
		LocalDate periodEnd = LocalDate.of(2026, 8, 31);
		LocalDate periodStart = periodEnd.minusDays(6);

		RecoveryAnalyticsSummary summary = service.summarize(periodStart, periodEnd, List.of());

		assertThat(summary.averageSleepMinutes()).isEmpty();
		assertThat(summary.averageSteps()).isEmpty();
		assertThat(summary.daysWithReportedEnergy()).isZero();
	}

	private DailyLog log(LocalDate date, Integer sleepMinutes, Integer steps, EnergyLevel energy) {
		DailyLog log = new DailyLog();
		log.setDate(date);
		log.setSleepMinutes(sleepMinutes);
		log.setSteps(steps);
		log.setEnergy(energy);
		return log;
	}
}
