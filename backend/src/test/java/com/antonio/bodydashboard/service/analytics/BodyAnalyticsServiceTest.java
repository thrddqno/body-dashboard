package com.antonio.bodydashboard.service.analytics;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.entity.BodyMetric;

class BodyAnalyticsServiceTest {

	private final BodyAnalyticsService service = new BodyAnalyticsService(null);

	@Test
	void returnsEmptySummaryWhenNoMetricsExist() {
		BodyAnalyticsSummary summary = service.summarize(List.of());

		assertThat(summary.latestWeightKg()).isEmpty();
		assertThat(summary.latestWeightDate()).isEmpty();
		assertThat(summary.sevenDayWeightChangeKg()).isEmpty();
		assertThat(summary.thirtyDayWeightChangeKg()).isEmpty();
		assertThat(summary.sevenDayMovingAverage()).isEmpty();
	}

	@Test
	void calculatesLatestWeightAndExactSevenAndThirtyDayChanges() {
		LocalDate latestDate = LocalDate.of(2026, 8, 31);

		BodyAnalyticsSummary summary = service.summarize(List.of(
				metric(latestDate.minusDays(30), "110.00"),
				metric(latestDate.minusDays(7), "112.25"),
				metric(latestDate.minusDays(1), "113.00"),
				metric(latestDate, "113.75")));

		assertThat(summary.latestWeightKg()).hasValueSatisfying(value -> assertThat(value).isEqualByComparingTo("113.75"));
		assertThat(summary.latestWeightDate()).contains(latestDate);
		assertThat(summary.sevenDayWeightChangeKg()).hasValueSatisfying(value -> assertThat(value).isEqualByComparingTo("1.50"));
		assertThat(summary.thirtyDayWeightChangeKg()).hasValueSatisfying(value -> assertThat(value).isEqualByComparingTo("3.75"));
	}

	@Test
	void leavesWeightChangesEmptyWhenExactComparisonDatesAreMissing() {
		LocalDate latestDate = LocalDate.of(2026, 8, 31);

		BodyAnalyticsSummary summary = service.summarize(List.of(
				metric(latestDate.minusDays(8), "112.25"),
				metric(latestDate.minusDays(29), "110.00"),
				metric(latestDate, "113.75")));

		assertThat(summary.sevenDayWeightChangeKg()).isEmpty();
		assertThat(summary.thirtyDayWeightChangeKg()).isEmpty();
	}

	@Test
	void calculatesSevenDayMovingAverageFromAvailableMeasurementsInEachWindow() {
		LocalDate date = LocalDate.of(2026, 8, 31);

		BodyAnalyticsSummary summary = service.summarize(List.of(
				metric(date.minusDays(8), "100.00"),
				metric(date.minusDays(6), "104.00"),
				metric(date.minusDays(3), "106.00"),
				metric(date, "108.00")));

		BodyAnalyticsSummary.MovingAveragePoint latestAverage = summary.sevenDayMovingAverage().getLast();
		assertThat(latestAverage.date()).isEqualTo(date);
		assertThat(latestAverage.measurementCount()).isEqualTo(3);
		assertThat(latestAverage.averageWeightKg()).isEqualByComparingTo("106.00");
	}

	private BodyMetric metric(LocalDate date, String weightKg) {
		BodyMetric metric = new BodyMetric();
		metric.setDate(date);
		metric.setWeightKg(new BigDecimal(weightKg));
		return metric;
	}
}
