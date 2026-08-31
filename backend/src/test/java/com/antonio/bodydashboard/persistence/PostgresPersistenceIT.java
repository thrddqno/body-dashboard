package com.antonio.bodydashboard.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.math.BigDecimal;
import java.sql.Connection;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.antonio.bodydashboard.dto.BodyMetricRequest;
import com.antonio.bodydashboard.dto.DailyLogRequest;
import com.antonio.bodydashboard.dto.DailyLogResponse;
import com.antonio.bodydashboard.dto.ExerciseSetRequest;
import com.antonio.bodydashboard.dto.WorkoutExerciseRequest;
import com.antonio.bodydashboard.dto.WorkoutRequest;
import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.exception.DuplicateBodyMetricDateException;
import com.antonio.bodydashboard.exception.PersistenceConstraintViolation;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;
import com.antonio.bodydashboard.service.BodyMetricService;
import com.antonio.bodydashboard.service.DailyLogService;
import com.antonio.bodydashboard.service.WorkoutService;

@SpringBootTest
@Import(PostgresPersistenceIT.ContainerConfiguration.class)
class PostgresPersistenceIT {

	@Autowired
	private PostgreSQLContainer postgres;

	@Autowired
	private DataSource dataSource;

	@Autowired
	private Flyway flyway;

	@Autowired
	private Environment environment;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private BodyMetricRepository bodyMetricRepository;

	@Autowired
	private DailyLogRepository dailyLogRepository;

	@Autowired
	private WorkoutRepository workoutRepository;

	@Autowired
	private BodyMetricService bodyMetricService;

	@Autowired
	private DailyLogService dailyLogService;

	@Autowired
	private WorkoutService workoutService;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@BeforeEach
	void cleanDatabase() {
		workoutRepository.deleteAll();
		dailyLogRepository.deleteAll();
		bodyMetricRepository.deleteAll();
	}

	@Test
	void startsPostgresAppliesFlywayAndValidatesJpaSchema() throws Exception {
		assertThat(postgres.isRunning()).isTrue();
		try (Connection connection = dataSource.getConnection()) {
			assertThat(connection.getMetaData().getDatabaseProductName()).isEqualTo("PostgreSQL");
		}
		assertThat(environment.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("validate");
		assertThat(flyway.info().pending()).isEmpty();
		assertThat(flyway.info().applied())
				.extracting(info -> info.getVersion().getVersion())
				.containsExactly("1", "2", "3", "4");
	}

	@Test
	void enforcesNamedConstraintsAndNumericDefinitions() {
		List<String> constraints = jdbcTemplate.queryForList(
				"select conname from pg_constraint where connamespace = 'public'::regnamespace",
				String.class);
		assertThat(constraints).contains(
				"uq_body_metrics_date",
				"chk_body_metrics_weight_kg_positive",
				"uq_daily_logs_date",
				"chk_daily_logs_energy_value",
				"chk_workouts_status",
				"chk_exercise_sets_rir_range");

		assertNumericColumn("body_metrics", "weight_kg", 6, 2);
		assertNumericColumn("body_metrics", "waist_cm", 6, 2);
		assertNumericColumn("body_metrics", "body_fat_percentage", 5, 2);
		assertNumericColumn("exercise_sets", "weight_kg", 7, 2);

		assertThatThrownBy(() -> jdbcTemplate.update(
				"insert into body_metrics (date, weight_kg) values (?, ?)",
				LocalDate.of(2026, 1, 1), BigDecimal.ZERO))
				.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbcTemplate.update(
				"insert into daily_logs (date, energy) values (?, ?)",
				LocalDate.of(2026, 1, 2), "EXHAUSTED"))
				.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbcTemplate.update(
				"insert into workouts (date, workout_type, status) values (?, ?, ?)",
				LocalDate.of(2026, 1, 3), "UPPER", "DONE"))
				.isInstanceOf(DataIntegrityViolationException.class);
		assertThatThrownBy(() -> jdbcTemplate.update(
				"insert into body_metrics (date, weight_kg) values (?, ?)",
				LocalDate.of(2026, 1, 4), new BigDecimal("10000.00")))
				.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void preservesPrecisionUniquenessAndNestedAggregatePersistence() {
		BodyMetric metric = new BodyMetric();
		metric.setDate(LocalDate.of(2026, 2, 1));
		metric.setWeightKg(new BigDecimal("9999.99"));
		BodyMetric saved = bodyMetricRepository.saveAndFlush(metric);

		assertThat(bodyMetricRepository.findById(saved.getId()).orElseThrow().getWeightKg())
				.isEqualByComparingTo("9999.99");
		BodyMetric duplicate = new BodyMetric();
		duplicate.setDate(metric.getDate());
		duplicate.setWeightKg(new BigDecimal("80.00"));
		Throwable duplicateFailure = catchThrowable(() -> bodyMetricRepository.saveAndFlush(duplicate));
		assertThat(duplicateFailure).isInstanceOf(DataIntegrityViolationException.class);
		assertThat(PersistenceConstraintViolation.isConstraint(duplicateFailure, "uq_body_metrics_date")).isTrue();

		WorkoutRequest workout = new WorkoutRequest(
				LocalDate.of(2026, 2, 2),
				"UPPER",
				WorkoutStatus.COMPLETED,
				null,
				List.of(new WorkoutExerciseRequest(
						"Bench Press",
						1,
						List.of(new ExerciseSetRequest(1, new BigDecimal("80.25"), 8, 2, false)))));
		Long workoutId = workoutService.create(workout).id();
		assertThat(jdbcTemplate.queryForObject(
				"select count(*) from workout_exercises where workout_id = ?", Long.class, workoutId)).isEqualTo(1L);
		assertThat(jdbcTemplate.queryForObject("select count(*) from exercise_sets", Long.class)).isEqualTo(1L);
	}

	@Test
	void returnsTheBodyMetricDuplicateDomainError() {
		BodyMetricRequest request = new BodyMetricRequest(
				LocalDate.of(2026, 3, 1), new BigDecimal("80.00"), null, null);
		bodyMetricService.create(request);

		assertThatThrownBy(() -> bodyMetricService.create(request))
				.isInstanceOf(DuplicateBodyMetricDateException.class)
				.hasMessage("Body metric already exists for date: 2026-03-01");
	}

	@Test
	void postgresExposesTheNamedConstraintDuringConcurrentFirstInserts() throws Exception {
		LocalDate date = LocalDate.of(2026, 3, 2);
		CyclicBarrier afterRead = new CyclicBarrier(2);

		try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
			Future<Throwable> first = executor.submit(() -> insertDailyLogAfterRead(date, 4000, afterRead));
			Future<Throwable> second = executor.submit(() -> insertDailyLogAfterRead(date, 9000, afterRead));

			List<Throwable> results = Arrays.asList(
					first.get(15, TimeUnit.SECONDS),
					second.get(15, TimeUnit.SECONDS));
			assertThat(results).filteredOn(result -> result == null).hasSize(1);
			assertThat(results).filteredOn(result -> result != null).singleElement()
					.satisfies(failure -> {
						assertThat(failure).isInstanceOf(DataIntegrityViolationException.class);
						assertThat(PersistenceConstraintViolation.isConstraint(failure, "uq_daily_logs_date")).isTrue();
					});
		}

		assertThat(dailyLogRepository.count()).isEqualTo(1);
	}

	@Test
	void concurrentFirstDailyUpsertsBothSucceedAndLeaveOneCompleteReplacement() throws Exception {
		LocalDate date = LocalDate.of(2026, 4, 1);
		DailyLogRequest first = new DailyLogRequest(420, 4000, EnergyLevel.LOW, "first pain", null, 2000, 120);
		DailyLogRequest second = new DailyLogRequest(480, 9000, EnergyLevel.HIGH, null, "second recovery", 2500, 170);
		CountDownLatch start = new CountDownLatch(1);

		try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
			Future<DailyLogResponse> firstResult = executor.submit(() -> upsertAfter(start, date, first));
			Future<DailyLogResponse> secondResult = executor.submit(() -> upsertAfter(start, date, second));
			start.countDown();

			DailyLogResponse firstResponse = firstResult.get(15, TimeUnit.SECONDS);
			DailyLogResponse secondResponse = secondResult.get(15, TimeUnit.SECONDS);
			assertThat(firstResponse.id()).isEqualTo(secondResponse.id());
		}

		assertThat(dailyLogRepository.count()).isEqualTo(1);
		var persisted = dailyLogRepository.findByDate(date).orElseThrow();
		assertThat(List.of(persisted.getSleepMinutes(), persisted.getSteps()))
				.isIn(List.of(420, 4000), List.of(480, 9000));
		if (persisted.getSleepMinutes() == 420) {
			assertThat(persisted.getEnergy()).isEqualTo(EnergyLevel.LOW);
			assertThat(persisted.getPainNotes()).isEqualTo("first pain");
			assertThat(persisted.getRecoveryNotes()).isNull();
			assertThat(persisted.getEstimatedCalories()).isEqualTo(2000);
			assertThat(persisted.getEstimatedProteinGrams()).isEqualTo(120);
		} else {
			assertThat(persisted.getEnergy()).isEqualTo(EnergyLevel.HIGH);
			assertThat(persisted.getPainNotes()).isNull();
			assertThat(persisted.getRecoveryNotes()).isEqualTo("second recovery");
			assertThat(persisted.getEstimatedCalories()).isEqualTo(2500);
			assertThat(persisted.getEstimatedProteinGrams()).isEqualTo(170);
		}
	}

	private Throwable insertDailyLogAfterRead(LocalDate date, int steps, CyclicBarrier afterRead) {
		try {
			transactionTemplate.executeWithoutResult(status -> {
				assertThat(dailyLogRepository.findByDate(date)).isEmpty();
				try {
					afterRead.await(10, TimeUnit.SECONDS);
				} catch (Exception exception) {
					throw new IllegalStateException(exception);
				}
				var dailyLog = new com.antonio.bodydashboard.entity.DailyLog();
				dailyLog.setDate(date);
				dailyLog.setSteps(steps);
				dailyLogRepository.saveAndFlush(dailyLog);
			});
			return null;
		} catch (Throwable failure) {
			return failure;
		}
	}

	private DailyLogResponse upsertAfter(CountDownLatch start, LocalDate date, DailyLogRequest request)
			throws InterruptedException {
		start.await();
		return dailyLogService.upsert(date, request);
	}

	private void assertNumericColumn(String table, String column, int precision, int scale) {
		Map<String, Object> definition = jdbcTemplate.queryForMap("""
				select numeric_precision, numeric_scale
				from information_schema.columns
				where table_schema = 'public' and table_name = ? and column_name = ?
				""", table, column);
		assertThat(((Number) definition.get("numeric_precision")).intValue()).isEqualTo(precision);
		assertThat(((Number) definition.get("numeric_scale")).intValue()).isEqualTo(scale);
	}

	@TestConfiguration(proxyBeanMethods = false)
	static class ContainerConfiguration {

		@Bean
		@ServiceConnection
		PostgreSQLContainer postgresContainer() {
			return new PostgreSQLContainer("postgres:16-alpine");
		}
	}
}
