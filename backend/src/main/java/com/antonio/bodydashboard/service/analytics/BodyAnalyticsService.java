package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.repository.BodyMetricRepository;

@Service
public class BodyAnalyticsService {

	private static final int MOVING_AVERAGE_DAYS = 7;

	private final BodyMetricRepository bodyMetricRepository;

	public BodyAnalyticsService(BodyMetricRepository bodyMetricRepository) {
		this.bodyMetricRepository = bodyMetricRepository;
	}

	@Transactional(readOnly = true)
	public BodyAnalyticsSummary summarize() {
		return summarize(bodyMetricRepository.findAllByOrderByDateDesc());
	}

	@Transactional(readOnly = true)
	public BodyPeriodAnalyticsSummary summarizePeriod(LocalDate periodStart, LocalDate periodEnd) {
		return summarizePeriod(bodyMetricRepository.findByDateBetweenOrderByDateAsc(periodStart, periodEnd));
	}

	public BodyPeriodAnalyticsSummary summarizePeriod(List<BodyMetric> metrics) {
		List<BodyMetric> sortedMetrics = sortedByDate(metrics);
		if (sortedMetrics.isEmpty()) {
			return new BodyPeriodAnalyticsSummary(Optional.empty(), Optional.empty());
		}

		BigDecimal latestWeightKg = sortedMetrics.getLast().getWeightKg();
		Optional<BigDecimal> weightChangeKg = sortedMetrics.size() < 2
				? Optional.empty()
				: Optional.of(latestWeightKg.subtract(sortedMetrics.getFirst().getWeightKg()));
		return new BodyPeriodAnalyticsSummary(Optional.of(latestWeightKg), weightChangeKg);
	}

	public BodyAnalyticsSummary summarize(List<BodyMetric> metrics) {
		List<BodyMetric> sortedMetrics = sortedByDate(metrics);
		if (sortedMetrics.isEmpty()) {
			return new BodyAnalyticsSummary(
					Optional.empty(),
					Optional.empty(),
					Optional.empty(),
					Optional.empty(),
					List.of());
		}

		BodyMetric latest = sortedMetrics.getLast();
		Map<LocalDate, BodyMetric> metricsByDate = sortedMetrics.stream()
				.collect(Collectors.toMap(BodyMetric::getDate, Function.identity(), (first, second) -> second));

		return new BodyAnalyticsSummary(
				Optional.of(latest.getWeightKg()),
				Optional.of(latest.getDate()),
				weightChange(latest, metricsByDate, 7),
				weightChange(latest, metricsByDate, 30),
				movingAverage(sortedMetrics, MOVING_AVERAGE_DAYS));
	}

	private Optional<BigDecimal> weightChange(
			BodyMetric latest,
			Map<LocalDate, BodyMetric> metricsByDate,
			int days) {
		return Optional.ofNullable(metricsByDate.get(latest.getDate().minusDays(days)))
				.map(previous -> latest.getWeightKg().subtract(previous.getWeightKg()));
	}

	private List<BodyAnalyticsSummary.MovingAveragePoint> movingAverage(List<BodyMetric> sortedMetrics, int windowDays) {
		return sortedMetrics.stream()
				.map(metric -> movingAverageAt(sortedMetrics, metric.getDate(), windowDays))
				.toList();
	}

	private BodyAnalyticsSummary.MovingAveragePoint movingAverageAt(
			List<BodyMetric> sortedMetrics,
			LocalDate date,
			int windowDays) {
		LocalDate windowStart = date.minusDays(windowDays - 1L);
		List<BigDecimal> weights = sortedMetrics.stream()
				.filter(metric -> !metric.getDate().isBefore(windowStart) && !metric.getDate().isAfter(date))
				.map(BodyMetric::getWeightKg)
				.toList();

		BigDecimal total = weights.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal average = total.divide(BigDecimal.valueOf(weights.size()), 2, RoundingMode.HALF_UP);
		return new BodyAnalyticsSummary.MovingAveragePoint(date, average, weights.size());
	}

	private List<BodyMetric> sortedByDate(List<BodyMetric> metrics) {
		return nullSafe(metrics).stream()
				.sorted(Comparator.comparing(BodyMetric::getDate))
				.toList();
	}

	private List<BodyMetric> nullSafe(List<BodyMetric> metrics) {
		return metrics == null ? List.of() : metrics;
	}
}
