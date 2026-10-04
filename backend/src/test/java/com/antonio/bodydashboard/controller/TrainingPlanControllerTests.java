package com.antonio.bodydashboard.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingPlanControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void returnsPersistedPlanForRequestedDate() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.date").value("2026-09-01"))
				.andExpect(jsonPath("$.dayOfWeek").value("TUESDAY"))
				.andExpect(jsonPath("$.workoutType").value("LOWER_A"))
				.andExpect(jsonPath("$.type").value("workout"))
				.andExpect(jsonPath("$.title").value("Lower A"))
				.andExpect(jsonPath("$.exercises", hasSize(6)))
				.andExpect(jsonPath("$.exercises[0].name").value("Leg Press"))
				.andExpect(jsonPath("$.exercises[2].setPrescription").value("2-3 sets"));
	}

	@Test
	void returnsCompleteTemplateForRequestedWorkoutType() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01").queryParam("workoutType", "upper_b"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.date").value("2026-09-01"))
				.andExpect(jsonPath("$.dayOfWeek").value("TUESDAY"))
				.andExpect(jsonPath("$.workoutType").value("UPPER_B"))
				.andExpect(jsonPath("$.title").value("Upper B"))
				.andExpect(jsonPath("$.subtitle").value("Upper body strength"))
				.andExpect(jsonPath("$.warmup", hasSize(0)))
				.andExpect(jsonPath("$.exercises", hasSize(8)))
				.andExpect(jsonPath("$.exercises[1].name").value("Seated Cable Row"));
	}

	@Test
	void returnsFullBodyTemplateForRequestedWorkoutType() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-02").queryParam("workoutType", "fullbody"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.date").value("2026-09-02"))
				.andExpect(jsonPath("$.workoutType").value("FULLBODY"))
				.andExpect(jsonPath("$.type").value("workout"))
				.andExpect(jsonPath("$.title").value("Full Body"))
				.andExpect(jsonPath("$.subtitle").value("Consolidated push, pull, legs, and core"))
				.andExpect(jsonPath("$.exercises", hasSize(9)))
				.andExpect(jsonPath("$.exercises[0].name").value("Leg Press"))
				.andExpect(jsonPath("$.exercises[0].sets").value(3));
	}

	@Test
	void returnsNotFoundForUnknownWorkoutType() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01").queryParam("workoutType", "UNKNOWN"))
				.andExpect(status().isNotFound());
	}

	@Test
	void usesCanonicalRestTemplateForRestOverrideOnWorkoutDay() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01").queryParam("workoutType", "REST"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.dayOfWeek").value("TUESDAY"))
				.andExpect(jsonPath("$.workoutType").value("REST"))
				.andExpect(jsonPath("$.subtitle").value("Onsite workday"));
	}

	@Test
	void returnsRestPlanForThursday() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-03"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.workoutType").value("REST"))
				.andExpect(jsonPath("$.type").value("rest"))
				.andExpect(jsonPath("$.subtitle").value("Recovery day"))
				.andExpect(jsonPath("$.optional", hasSize(0)));
	}

	@Test
	void returnsRestPlansForWednesdayThroughFriday() throws Exception {
		for (String date : new String[] { "2026-09-02", "2026-09-03", "2026-09-04" }) {
			mockMvc.perform(get("/api/training-plans/{date}", date))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.workoutType").value("REST"))
					.andExpect(jsonPath("$.type").value("rest"));
		}
	}

	@Test
	void returnsLowerBAlternativesAndBackDiscomfortRule() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-06"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.workoutType").value("LOWER_B"))
				.andExpect(jsonPath("$.exercises[0].notes").value("Hack Squat may be used instead."))
				.andExpect(jsonPath("$.exercises[3].notes").value(
						"Romanian Deadlift is optional when your back is comfortable. Use Hip Thrust Machine instead if you report back discomfort."))
				.andExpect(jsonPath("$.optional[0]").value("10-20 minutes easy cardio"));
	}

	@Test
	void usesCurrentScheduleForRetiredWorkoutTypeOverride() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01").queryParam("workoutType", "upper"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.workoutType").value("LOWER_A"))
				.andExpect(jsonPath("$.title").value("Lower A"));
	}

	@Test
	void rejectsInvalidDate() throws Exception {
		mockMvc.perform(get("/api/training-plans/not-a-date"))
				.andExpect(status().isBadRequest());
	}
}
