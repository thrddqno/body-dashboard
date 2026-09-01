package com.antonio.bodydashboard.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.dto.WeeklyAiAnalysisResponse;
import com.antonio.bodydashboard.service.ai.WeeklyAiAnalysisService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsSummary;

class AnalyticsMcpToolsTest {

	private final WorkoutAnalyticsService analyticsService = mock(WorkoutAnalyticsService.class);
	private final WeeklyAiAnalysisService analysisService = mock(WeeklyAiAnalysisService.class);
	private final AnalyticsMcpTools tools = new AnalyticsMcpTools(analyticsService, analysisService);

	@Test
	void delegatesDeterministicMondayToSundaySummary() {
		LocalDate start = LocalDate.of(2026, 8, 31);
		LocalDate end = LocalDate.of(2026, 9, 6);
		WorkoutAnalyticsSummary summary = new WorkoutAnalyticsSummary(
				start, end, 3, 1, Optional.of(new BigDecimal("75.00")), List.of(), List.of());
		when(analyticsService.summarizeWeek(start, end)).thenReturn(summary);

		AnalyticsMcpTools.WeeklyWorkoutSummaryResult result = tools.getWeeklyWorkoutSummary("2026-08-31");

		assertThat(result.completedWorkouts()).isEqualTo(3);
		assertThat(result.adherencePercentage()).isEqualByComparingTo("75.00");
		verify(analyticsService).summarizeWeek(start, end);
	}

	@Test
	void rejectsNonMondayWeekStart() {
		assertThatIllegalArgumentException().isThrownBy(() -> tools.getWeeklyWorkoutSummary("2026-09-01"))
				.withMessage("Invalid 'weekStart': date must be a Monday");
		verifyNoInteractions(analyticsService);
	}

	@Test
	void returnsLatestStoredAnalysisWithoutGenerating() {
		WeeklyAiAnalysisResponse analysis = new WeeklyAiAnalysisResponse(
				"Stored", List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), Instant.EPOCH);
		when(analysisService.latest()).thenReturn(Optional.of(analysis));

		AnalyticsMcpTools.LatestAnalysisResult result = tools.getLatestAnalysis();

		assertThat(result.available()).isTrue();
		assertThat(result.analysis()).isSameAs(analysis);
		verify(analysisService).latest();
	}

	@Test
	void returnsClearResultWhenNoAnalysisExists() {
		when(analysisService.latest()).thenReturn(Optional.empty());

		assertThat(tools.getLatestAnalysis().available()).isFalse();
	}
}
