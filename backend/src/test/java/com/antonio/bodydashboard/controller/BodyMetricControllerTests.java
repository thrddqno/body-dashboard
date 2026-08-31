package com.antonio.bodydashboard.controller;

import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.dto.BodyMetricRequest;
import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.repository.BodyMetricRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BodyMetricControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private BodyMetricRepository bodyMetricRepository;

	@BeforeEach
	void setUp() {
		bodyMetricRepository.deleteAll();
	}

	@Test
	void createsBodyMetric() throws Exception {
		BodyMetricRequest request = new BodyMetricRequest(
				LocalDate.of(2026, 8, 30),
				new BigDecimal("111.75"),
				new BigDecimal("110.0"),
				new BigDecimal("32.0"));

		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", endsWith("/api/body-metrics/" + bodyMetricRepository.findAll().getFirst().getId())))
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.weightKg").value(111.75))
				.andExpect(jsonPath("$.waistCm").value(110.0))
				.andExpect(jsonPath("$.bodyFatPercentage").value(32.0))
				.andExpect(jsonPath("$.createdAt").exists());
	}

	@Test
	void rejectsMissingRequiredFields() throws Exception {
		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request validation failed"))
				.andExpect(jsonPath("$.fieldErrors.date").value("date is required"))
				.andExpect(jsonPath("$.fieldErrors.weightKg").value("weightKg is required"));
	}

	@Test
	void rejectsNonPositiveWeight() throws Exception {
		BodyMetricRequest request = new BodyMetricRequest(
				LocalDate.of(2026, 8, 30),
				BigDecimal.ZERO,
				new BigDecimal("110.0"),
				new BigDecimal("32.0"));

		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.weightKg").value("weightKg must be positive"));
	}

	@Test
	void rejectsValuesOutsideDatabasePrecisionAndScale() throws Exception {
		BodyMetricRequest request = new BodyMetricRequest(
				LocalDate.of(2026, 8, 30),
				new BigDecimal("10000.00"),
				new BigDecimal("10000.00"),
				new BigDecimal("18.555"));

		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.weightKg").exists())
				.andExpect(jsonPath("$.fieldErrors.waistCm").exists())
				.andExpect(jsonPath("$.fieldErrors.bodyFatPercentage").exists());
	}

	@Test
	void rejectsDuplicateDate() throws Exception {
		BodyMetricRequest request = new BodyMetricRequest(
				LocalDate.of(2026, 8, 30),
				new BigDecimal("111.75"),
				new BigDecimal("110.0"),
				new BigDecimal("32.0"));

		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/body-metrics")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Body metric already exists for date: 2026-08-30"));
	}

	@Test
	void returnsAllBodyMetricsOrderedByDateDescending() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 28), "112.00");
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		saveBodyMetric(LocalDate.of(2026, 8, 29), "111.90");

		mockMvc.perform(get("/api/body-metrics"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].date").value("2026-08-30"))
				.andExpect(jsonPath("$[1].date").value("2026-08-29"))
				.andExpect(jsonPath("$[2].date").value("2026-08-28"));
	}

	@Test
	void returnsOneBodyMetric() throws Exception {
		BodyMetric bodyMetric = saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");

		mockMvc.perform(get("/api/body-metrics/{id}", bodyMetric.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(bodyMetric.getId()))
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.weightKg").value(111.75));
	}

	@Test
	void returnsNotFoundForMissingBodyMetric() throws Exception {
		mockMvc.perform(get("/api/body-metrics/{id}", 999L))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Body metric not found for id: 999"));
	}

	@Test
	void returnsApiErrorForMalformedId() throws Exception {
		mockMvc.perform(get("/api/body-metrics/not-a-number"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.error").value("Bad Request"))
				.andExpect(jsonPath("$.message").value("Request path contains an invalid value"))
				.andExpect(jsonPath("$.fieldErrors").isEmpty());
	}

	private BodyMetric saveBodyMetric(LocalDate date, String weightKg) {
		BodyMetric bodyMetric = new BodyMetric();
		bodyMetric.setDate(date);
		bodyMetric.setWeightKg(new BigDecimal(weightKg));
		return bodyMetricRepository.save(bodyMetric);
	}
}
