package com.antonio.bodydashboard.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.dto.ExerciseSetRequest;
import com.antonio.bodydashboard.dto.WorkoutExerciseRequest;
import com.antonio.bodydashboard.dto.WorkoutRequest;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.WorkoutRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkoutControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WorkoutRepository workoutRepository;

	@BeforeEach
	void setUp() {
		workoutRepository.deleteAll();
	}

	@Test
	void createsNestedWorkout() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"PULL",
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("Lat Pulldown", 1, List.of(setRequest(1, "50.00", 12, 2, false)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(header().exists("Location"))
				.andExpect(jsonPath("$.id").exists())
				.andExpect(jsonPath("$.date").value("2026-08-26"))
				.andExpect(jsonPath("$.workoutType").value("PULL"))
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.exercises", hasSize(1)))
				.andExpect(jsonPath("$.exercises[0].exerciseName").value("Lat Pulldown"))
				.andExpect(jsonPath("$.exercises[0].orderIndex").value(1))
				.andExpect(jsonPath("$.exercises[0].sets", hasSize(1)))
				.andExpect(jsonPath("$.exercises[0].sets[0].setNumber").value(1))
				.andExpect(jsonPath("$.exercises[0].sets[0].weightKg").value(50.00))
				.andExpect(jsonPath("$.exercises[0].sets[0].reps").value(12))
				.andExpect(jsonPath("$.exercises[0].sets[0].rir").value(2))
				.andExpect(jsonPath("$.exercises[0].sets[0].warmup").value(false))
				.andExpect(jsonPath("$.createdAt").exists())
				.andExpect(jsonPath("$.updatedAt").exists());

		assertThat(workoutRepository.count()).isEqualTo(1);
	}

	@Test
	void preservesExerciseOrderByOrderIndex() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"UPPER",
				WorkoutStatus.COMPLETED,
				List.of(
						exerciseRequest("Second Exercise", 2, List.of(setRequest(1, "20.00", 10, null, false))),
						exerciseRequest("First Exercise", 1, List.of(setRequest(1, "10.00", 12, null, false)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.exercises[0].exerciseName").value("First Exercise"))
				.andExpect(jsonPath("$.exercises[0].orderIndex").value(1))
				.andExpect(jsonPath("$.exercises[1].exerciseName").value("Second Exercise"))
				.andExpect(jsonPath("$.exercises[1].orderIndex").value(2));
	}

	@Test
	void preservesSetOrderBySetNumber() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"PUSH",
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("Bench Press", 1, List.of(
						setRequest(2, "60.00", 8, 1, false),
						setRequest(1, "40.00", 10, 3, true)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.exercises[0].sets[0].setNumber").value(1))
				.andExpect(jsonPath("$.exercises[0].sets[0].warmup").value(true))
				.andExpect(jsonPath("$.exercises[0].sets[1].setNumber").value(2))
				.andExpect(jsonPath("$.exercises[0].sets[1].warmup").value(false));
	}

	@Test
	void rejectsInvalidReps() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"PULL",
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("Lat Pulldown", 1, List.of(setRequest(1, "50.00", 0, 2, false)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request validation failed"))
				.andExpect(jsonPath("$.fieldErrors['exercises[0].sets[0].reps']").value("reps must be positive"));
	}

	@Test
	void rejectsInvalidRir() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"PULL",
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("Lat Pulldown", 1, List.of(setRequest(1, "50.00", 12, 11, false)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request validation failed"))
				.andExpect(jsonPath("$.fieldErrors['exercises[0].sets[0].rir']").value("rir must be less than or equal to 10"));
	}

	@Test
	void rejectsNullExerciseElement() throws Exception {
		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"date":"2026-08-26","workoutType":"PULL","status":"COMPLETED","exercises":[null]}
							"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request validation failed"))
				.andExpect(jsonPath("$.fieldErrors['exercises[0]']").value("exercise must not be null"));
	}

	@Test
	void rejectsNullSetElement() throws Exception {
		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"date":"2026-08-26","workoutType":"PULL","status":"COMPLETED","exercises":[{"exerciseName":"Bench Press","orderIndex":1,"sets":[null]}]}
							"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors['exercises[0].sets[0]']").value("set must not be null"));
	}

	@Test
	void rejectsValuesOutsideDatabaseLengthAndPrecision() throws Exception {
		WorkoutRequest request = workoutRequest(
				LocalDate.of(2026, 8, 26),
				"X".repeat(101),
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("X".repeat(256), 1, List.of(setRequest(1, "100000.00", 8, 2, false)))));

		mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.workoutType").exists())
				.andExpect(jsonPath("$.fieldErrors['exercises[0].exerciseName']").exists())
				.andExpect(jsonPath("$.fieldErrors['exercises[0].sets[0].weightKg']").exists());
	}

	@Test
	void retrievesNestedWorkout() throws Exception {
		Long workoutId = createWorkout(workoutRequest(
				LocalDate.of(2026, 8, 26),
				"PULL",
				WorkoutStatus.COMPLETED,
				List.of(exerciseRequest("Lat Pulldown", 1, List.of(setRequest(1, "50.00", 12, 2, false))))));

		mockMvc.perform(get("/api/workouts/{id}", workoutId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(workoutId))
				.andExpect(jsonPath("$.date").value("2026-08-26"))
				.andExpect(jsonPath("$.workoutType").value("PULL"))
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.exercises[0].exerciseName").value("Lat Pulldown"))
				.andExpect(jsonPath("$.exercises[0].sets[0].reps").value(12));
	}

	@Test
	void returnsWorkoutsNewestFirst() throws Exception {
		createWorkout(workoutRequest(LocalDate.of(2026, 8, 24), "PUSH", WorkoutStatus.COMPLETED, List.of()));
		createWorkout(workoutRequest(LocalDate.of(2026, 8, 26), "PULL", WorkoutStatus.COMPLETED, List.of()));
		createWorkout(workoutRequest(LocalDate.of(2026, 8, 25), "LEGS", WorkoutStatus.PLANNED, List.of()));

		mockMvc.perform(get("/api/workouts"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].date").value("2026-08-26"))
				.andExpect(jsonPath("$[1].date").value("2026-08-25"))
				.andExpect(jsonPath("$[2].date").value("2026-08-24"));
	}

	@Test
	void returnsNotFoundForMissingWorkout() throws Exception {
		mockMvc.perform(get("/api/workouts/{id}", 999L))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Workout not found for id: 999"));
	}

	@Test
	void updatesPlannedWorkoutToCompleted() throws Exception {
		Long workoutId = createWorkout(workoutRequest(LocalDate.of(2026, 8, 30), "UPPER", WorkoutStatus.PLANNED, List.of()));

		mockMvc.perform(patch("/api/workouts/{id}/status", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"status\":\"COMPLETED\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(workoutId))
				.andExpect(jsonPath("$.status").value("COMPLETED"));

		assertThat(workoutRepository.findById(workoutId).orElseThrow().getStatus()).isEqualTo(WorkoutStatus.COMPLETED);
	}

	@Test
	void updatesPlannedWorkoutToMissed() throws Exception {
		Long workoutId = createWorkout(workoutRequest(LocalDate.of(2026, 8, 30), "UPPER", WorkoutStatus.PLANNED, List.of()));

		mockMvc.perform(patch("/api/workouts/{id}/status", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"status\":\"MISSED\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(workoutId))
				.andExpect(jsonPath("$.status").value("MISSED"));

		assertThat(workoutRepository.findById(workoutId).orElseThrow().getStatus()).isEqualTo(WorkoutStatus.MISSED);
	}

	@Test
	void returnsNotFoundWhenUpdatingMissingWorkoutStatus() throws Exception {
		mockMvc.perform(patch("/api/workouts/{id}/status", 999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"status\":\"COMPLETED\"}"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Workout not found for id: 999"));
	}

	@Test
	void rejectsInvalidStatusUpdate() throws Exception {
		Long workoutId = createWorkout(workoutRequest(LocalDate.of(2026, 8, 30), "UPPER", WorkoutStatus.PLANNED, List.of()));

		mockMvc.perform(patch("/api/workouts/{id}/status", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"status\":\"DONE\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Request body is malformed or contains invalid values"));

		assertThat(workoutRepository.findById(workoutId).orElseThrow().getStatus()).isEqualTo(WorkoutStatus.PLANNED);
	}

	@Test
	void keepsWorkoutContentsUnchangedAfterStatusUpdate() throws Exception {
		WorkoutRequest request = new WorkoutRequest(
				LocalDate.of(2026, 8, 30),
				"UPPER",
				WorkoutStatus.PLANNED,
				"Bench press focus",
				List.of(exerciseRequest("Bench Press", 1, List.of(setRequest(1, "60.00", 8, 1, false)))));
		Long workoutId = createWorkout(request);

		mockMvc.perform(patch("/api/workouts/{id}/status", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"status\":\"COMPLETED\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(workoutId))
				.andExpect(jsonPath("$.date").value("2026-08-30"))
				.andExpect(jsonPath("$.workoutType").value("UPPER"))
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.notes").value("Bench press focus"))
				.andExpect(jsonPath("$.exercises", hasSize(1)))
				.andExpect(jsonPath("$.exercises[0].exerciseName").value("Bench Press"))
				.andExpect(jsonPath("$.exercises[0].orderIndex").value(1))
				.andExpect(jsonPath("$.exercises[0].sets", hasSize(1)))
				.andExpect(jsonPath("$.exercises[0].sets[0].setNumber").value(1))
				.andExpect(jsonPath("$.exercises[0].sets[0].weightKg").value(60.00))
				.andExpect(jsonPath("$.exercises[0].sets[0].reps").value(8))
				.andExpect(jsonPath("$.exercises[0].sets[0].rir").value(1))
				.andExpect(jsonPath("$.exercises[0].sets[0].warmup").value(false));

		assertThat(workoutRepository.count()).isEqualTo(1);
	}

	@Test
	void updatesPlannedWorkoutDetails() throws Exception {
		Long workoutId = createWorkout(workoutRequest(
				LocalDate.of(2026, 8, 30), "UPPER", WorkoutStatus.PLANNED,
				List.of(exerciseRequest("Bench Press", 1, List.of(setRequest(1, "60.00", 8, 1, false))))));

		WorkoutRequest update = new WorkoutRequest(
				LocalDate.of(2026, 9, 1), "PUSH", WorkoutStatus.PLANNED, "Updated notes",
				List.of(
						exerciseRequest("Incline Press", 1, List.of(setRequest(1, "50.00", 10, 2, true))),
						exerciseRequest("Dumbbell Fly", 2, List.of(setRequest(1, "15.00", 12, 3, false)))));

		mockMvc.perform(put("/api/workouts/{id}", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(update)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(workoutId))
				.andExpect(jsonPath("$.date").value("2026-09-01"))
				.andExpect(jsonPath("$.workoutType").value("PUSH"))
				.andExpect(jsonPath("$.status").value("PLANNED"))
				.andExpect(jsonPath("$.notes").value("Updated notes"))
				.andExpect(jsonPath("$.exercises", hasSize(2)))
				.andExpect(jsonPath("$.exercises[0].exerciseName").value("Incline Press"))
				.andExpect(jsonPath("$.exercises[0].sets", hasSize(1)))
				.andExpect(jsonPath("$.exercises[0].sets[0].warmup").value(true))
				.andExpect(jsonPath("$.exercises[1].exerciseName").value("Dumbbell Fly"));

		assertThat(workoutRepository.count()).isEqualTo(1);
	}

	@Test
	void rejectsUpdateOfCompletedWorkout() throws Exception {
		Long workoutId = createWorkout(workoutRequest(
				LocalDate.of(2026, 8, 30), "UPPER", WorkoutStatus.COMPLETED, List.of()));

		WorkoutRequest update = workoutRequest(
				LocalDate.of(2026, 9, 1), "PUSH", WorkoutStatus.PLANNED, List.of());

		mockMvc.perform(put("/api/workouts/{id}", workoutId)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(update)))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Cannot update a workout that is already completed"));
	}

	@Test
	void returnsNotFoundWhenUpdatingMissingWorkout() throws Exception {
		WorkoutRequest update = workoutRequest(
				LocalDate.of(2026, 9, 1), "PUSH", WorkoutStatus.PLANNED, List.of());

		mockMvc.perform(put("/api/workouts/{id}", 999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(update)))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Workout not found for id: 999"));
	}

	private Long createWorkout(WorkoutRequest request) throws Exception {
		String response = mockMvc.perform(post("/api/workouts")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();

		return objectMapper.readTree(response).get("id").longValue();
	}

	private WorkoutRequest workoutRequest(
			LocalDate date,
			String workoutType,
			WorkoutStatus status,
			List<WorkoutExerciseRequest> exercises) {
		return new WorkoutRequest(date, workoutType, status, null, exercises);
	}

	private WorkoutExerciseRequest exerciseRequest(String exerciseName, Integer orderIndex, List<ExerciseSetRequest> sets) {
		return new WorkoutExerciseRequest(exerciseName, orderIndex, sets);
	}

	private ExerciseSetRequest setRequest(Integer setNumber, String weightKg, Integer reps, Integer rir, Boolean warmup) {
		return new ExerciseSetRequest(setNumber, new BigDecimal(weightKg), reps, rir, warmup);
	}
}
