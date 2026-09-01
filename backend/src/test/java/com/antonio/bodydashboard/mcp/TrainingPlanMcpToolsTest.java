package com.antonio.bodydashboard.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.dto.TrainingPlanResponse;
import com.antonio.bodydashboard.service.TrainingPlanService;

class TrainingPlanMcpToolsTest {

	private final TrainingPlanService service = mock(TrainingPlanService.class);
	private final TrainingPlanMcpTools tools = new TrainingPlanMcpTools(service);

	@Test
	void delegatesTrainingPlanLookup() {
		LocalDate date = LocalDate.of(2026, 9, 1);
		TrainingPlanResponse plan = new TrainingPlanResponse(
				date, DayOfWeek.TUESDAY, "PUSH", "workout", "Push", "Chest", List.of(), List.of(), List.of(), List.of());
		when(service.getForDate(date)).thenReturn(Optional.of(plan));

		TrainingPlanMcpTools.TrainingPlanResult result = tools.getTrainingPlan("2026-09-01");

		assertThat(result.found()).isTrue();
		assertThat(result.plan()).isSameAs(plan);
		verify(service).getForDate(date);
	}

	@Test
	void returnsCleanMissingPlanResult() {
		LocalDate date = LocalDate.of(2026, 9, 1);
		when(service.getForDate(date)).thenReturn(Optional.empty());

		assertThat(tools.getTrainingPlan("2026-09-01").found()).isFalse();
	}

	@Test
	void rejectsInvalidDate() {
		assertThatIllegalArgumentException().isThrownBy(() -> tools.getTrainingPlan("invalid"));
		verifyNoInteractions(service);
	}
}
