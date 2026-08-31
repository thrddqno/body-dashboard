package com.antonio.bodydashboard.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.repository.DailyLogRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DailyLogControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private DailyLogRepository dailyLogRepository;

	@BeforeEach
	void setUp() {
		dailyLogRepository.deleteAll();
	}

	@Test
	void createsDailyLogThroughPut() throws Exception {
		DailyLogRequest request = new DailyLogRequest(
				420,
				5200,
				EnergyLevel.AVERAGE,
				null,
				"Normal recovery",
				2100,
				130);

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").exists())
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.sleepMinutes").value(420))
				.andExpect(jsonPath("$.steps").value(5200))
				.andExpect(jsonPath("$.energy").value("AVERAGE"))
				.andExpect(jsonPath("$.painNotes").doesNotExist())
				.andExpect(jsonPath("$.recoveryNotes").value("Normal recovery"))
				.andExpect(jsonPath("$.estimatedCalories").value(2100))
				.andExpect(jsonPath("$.estimatedProteinGrams").value(130))
				.andExpect(jsonPath("$.createdAt").exists())
				.andExpect(jsonPath("$.updatedAt").exists());

		assertThat(dailyLogRepository.count()).isEqualTo(1);
	}

	@Test
	void updatesExistingDailyLogThroughPut() throws Exception {
		DailyLog existing = saveDailyLog(LocalDate.of(2026, 8, 30), 400, 3000, EnergyLevel.LOW);
		DailyLogRequest request = new DailyLogRequest(
				450,
				6000,
				EnergyLevel.HIGH,
				"No pain",
				"Recovered well",
				2300,
				150);

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(existing.getId()))
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.sleepMinutes").value(450))
				.andExpect(jsonPath("$.steps").value(6000))
				.andExpect(jsonPath("$.energy").value("HIGH"))
				.andExpect(jsonPath("$.painNotes").value("No pain"))
				.andExpect(jsonPath("$.recoveryNotes").value("Recovered well"))
				.andExpect(jsonPath("$.estimatedCalories").value(2300))
				.andExpect(jsonPath("$.estimatedProteinGrams").value(150));

		assertThat(dailyLogRepository.count()).isEqualTo(1);
	}

	@Test
	void rejectsNegativeValues() throws Exception {
		DailyLogRequest request = new DailyLogRequest(
				-1,
				-1,
				EnergyLevel.AVERAGE,
				null,
				null,
				-1,
				-1);

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request validation failed"))
				.andExpect(jsonPath("$.fieldErrors.sleepMinutes").value("sleepMinutes must be greater than or equal to 0"))
				.andExpect(jsonPath("$.fieldErrors.steps").value("steps must be greater than or equal to 0"))
				.andExpect(jsonPath("$.fieldErrors.estimatedCalories").value("estimatedCalories must be greater than or equal to 0"))
				.andExpect(jsonPath("$.fieldErrors.estimatedProteinGrams").value("estimatedProteinGrams must be greater than or equal to 0"));
	}

	@Test
	void rejectsMalformedJsonAndEnergyValue() throws Exception {
		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"energy\":\"EXHAUSTED\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request body is malformed or contains invalid values"));

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"steps\":"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.error").value("Bad Request"))
				.andExpect(jsonPath("$.fieldErrors").isEmpty());
	}

	@Test
	void emptyPutFullyReplacesExistingValues() throws Exception {
		saveDailyLog(LocalDate.of(2026, 8, 30), 400, 3000, EnergyLevel.LOW);

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.sleepMinutes").doesNotExist())
				.andExpect(jsonPath("$.steps").doesNotExist())
				.andExpect(jsonPath("$.energy").doesNotExist());

		DailyLog replaced = dailyLogRepository.findByDate(LocalDate.of(2026, 8, 30)).orElseThrow();
		assertThat(replaced.getSleepMinutes()).isNull();
		assertThat(replaced.getSteps()).isNull();
		assertThat(replaced.getEnergy()).isNull();
	}

	@Test
	void returnsApiErrorForMalformedPathDate() throws Exception {
		mockMvc.perform(get("/api/daily-logs/not-a-date"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request path contains an invalid value"));
	}

	@Test
	void retrievesExistingDate() throws Exception {
		DailyLog dailyLog = saveDailyLog(LocalDate.of(2026, 8, 30), 420, 5200, EnergyLevel.AVERAGE);

		mockMvc.perform(get("/api/daily-logs/{date}", "2026-08-30"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(dailyLog.getId()))
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.sleepMinutes").value(420))
				.andExpect(jsonPath("$.steps").value(5200))
				.andExpect(jsonPath("$.energy").value("AVERAGE"));
	}

	@Test
	void returnsNotFoundForMissingDate() throws Exception {
		mockMvc.perform(get("/api/daily-logs/{date}", "2026-08-30"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Daily log not found for date: 2026-08-30"));
	}

	@Test
	void upsertKeepsOneRecordPerDate() throws Exception {
		DailyLogRequest firstRequest = new DailyLogRequest(420, 5200, EnergyLevel.AVERAGE, null, null, 2100, 130);
		DailyLogRequest secondRequest = new DailyLogRequest(360, 8000, EnergyLevel.HIGH, null, "Better activity", 2200, 140);

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(firstRequest)))
				.andExpect(status().isOk());
		Long createdId = dailyLogRepository.findByDate(LocalDate.of(2026, 8, 30)).orElseThrow().getId();

		mockMvc.perform(put("/api/daily-logs/{date}", "2026-08-30")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(secondRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(createdId))
				.andExpect(jsonPath("$.steps").value(8000))
				.andExpect(jsonPath("$.recoveryNotes").value("Better activity"));

		assertThat(dailyLogRepository.count()).isEqualTo(1);
	}

	private DailyLog saveDailyLog(LocalDate date, Integer sleepMinutes, Integer steps, EnergyLevel energy) {
		DailyLog dailyLog = new DailyLog();
		dailyLog.setDate(date);
		dailyLog.setSleepMinutes(sleepMinutes);
		dailyLog.setSteps(steps);
		dailyLog.setEnergy(energy);
		return dailyLogRepository.save(dailyLog);
	}
}
