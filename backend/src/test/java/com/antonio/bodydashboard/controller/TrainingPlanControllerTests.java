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
				.andExpect(jsonPath("$.workoutType").value("PUSH"))
				.andExpect(jsonPath("$.type").value("workout"))
				.andExpect(jsonPath("$.title").value("Push"))
				.andExpect(jsonPath("$.exercises", hasSize(5)))
				.andExpect(jsonPath("$.exercises[0].name").value("Machine Chest Press"));
	}

	@Test
	void returnsCompleteTemplateForRequestedWorkoutType() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-01").queryParam("workoutType", "upper"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.date").value("2026-09-01"))
				.andExpect(jsonPath("$.dayOfWeek").value("TUESDAY"))
				.andExpect(jsonPath("$.workoutType").value("UPPER"))
				.andExpect(jsonPath("$.title").value("Upper"))
				.andExpect(jsonPath("$.subtitle").value("Upper body plus skill practice"))
				.andExpect(jsonPath("$.warmup", hasSize(2)))
				.andExpect(jsonPath("$.exercises", hasSize(7)))
				.andExpect(jsonPath("$.exercises[1].name").value("Seated Cable Row"));
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
				.andExpect(jsonPath("$.subtitle").value("Recovery day"));
	}

	@Test
	void returnsRestPlanForMonday() throws Exception {
		mockMvc.perform(get("/api/training-plans/2026-09-07"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.workoutType").value("REST"))
				.andExpect(jsonPath("$.type").value("rest"))
				.andExpect(jsonPath("$.optional", hasSize(3)));
	}

	@Test
	void rejectsInvalidDate() throws Exception {
		mockMvc.perform(get("/api/training-plans/not-a-date"))
				.andExpect(status().isBadRequest());
	}
}
