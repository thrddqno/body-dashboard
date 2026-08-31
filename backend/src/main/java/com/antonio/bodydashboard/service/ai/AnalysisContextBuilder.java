package com.antonio.bodydashboard.service.ai;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;
import com.antonio.bodydashboard.service.analytics.BodyAnalyticsService;
import com.antonio.bodydashboard.service.analytics.BodyAnalyticsSummary;
import com.antonio.bodydashboard.service.analytics.RecoveryAnalyticsService;
import com.antonio.bodydashboard.service.analytics.RecoveryAnalyticsSummary;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsSummary;

@Service
public class AnalysisContextBuilder {

	private static final int RECENT_DAILY_LOG_LIMIT = 7;
	private static final int RECENT_WORKOUT_LIMIT = 5;

	private final Clock clock;
	private final BodyAnalyticsService bodyAnalyticsService;
	private final RecoveryAnalyticsService recoveryAnalyticsService;
	private final WorkoutAnalyticsService workoutAnalyticsService;
	private final DailyLogRepository dailyLogRepository;
	private final WorkoutRepository workoutRepository;

	public AnalysisContextBuilder(
			Clock clock,
			BodyAnalyticsService bodyAnalyticsService,
			RecoveryAnalyticsService recoveryAnalyticsService,
			WorkoutAnalyticsService workoutAnalyticsService,
			DailyLogRepository dailyLogRepository,
			WorkoutRepository workoutRepository) {
		this.clock = clock;
		this.bodyAnalyticsService = bodyAnalyticsService;
		this.recoveryAnalyticsService = recoveryAnalyticsService;
		this.workoutAnalyticsService = workoutAnalyticsService;
		this.dailyLogRepository = dailyLogRepository;
		this.workoutRepository = workoutRepository;
	}

	@Transactional(readOnly = true)
	public AnalysisContext buildCurrentDashboardContext() {
		LocalDate today = LocalDate.now(clock);
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

		BodyAnalyticsSummary body = bodyAnalyticsService.summarize();
		RecoveryAnalyticsSummary recovery = recoveryAnalyticsService.summarizeLastSevenDays(today);
		WorkoutAnalyticsSummary training = workoutAnalyticsService.summarizeWeek(weekStart, weekEnd);

		List<AnalysisContext.RecentDailyLog> recentDailyLogs = dailyLogRepository.findByOrderByDateDesc(PageRequest.of(0, RECENT_DAILY_LOG_LIMIT))
				.stream()
				.map(this::toRecentDailyLog)
				.toList();
		List<AnalysisContext.RecentWorkout> recentWorkouts = workoutRepository.findByOrderByDateDescCreatedAtDesc(PageRequest.of(0, RECENT_WORKOUT_LIMIT))
				.stream()
				.map(this::toRecentWorkout)
				.toList();

		return new AnalysisContext(
				Instant.now(clock),
				new AnalysisContext.Period(weekStart, weekEnd),
				toBodyFacts(body),
				toRecoveryFacts(recovery),
				toTrainingFacts(training),
				recentDailyLogs,
				recentWorkouts,
				dataGaps(body, recovery, training, recentDailyLogs, recentWorkouts));
	}

	private AnalysisContext.BodyFacts toBodyFacts(BodyAnalyticsSummary body) {
		return new AnalysisContext.BodyFacts(
				body.latestWeightKg().orElse(null),
				body.latestWeightDate().orElse(null),
				body.sevenDayWeightChangeKg().orElse(null),
				body.thirtyDayWeightChangeKg().orElse(null));
	}

	private AnalysisContext.RecoveryFacts toRecoveryFacts(RecoveryAnalyticsSummary recovery) {
		return new AnalysisContext.RecoveryFacts(
				recovery.periodStart(),
				recovery.periodEnd(),
				recovery.averageSleepMinutes().map(this::minutesToHours).orElse(null),
				recovery.averageSteps().orElse(null),
				recovery.daysWithReportedEnergy());
	}

	private AnalysisContext.TrainingFacts toTrainingFacts(WorkoutAnalyticsSummary training) {
		return new AnalysisContext.TrainingFacts(
				training.weekStart(),
				training.weekEnd(),
				training.completedWorkoutsThisWeek(),
				training.missedWorkoutsThisWeek(),
				training.adherencePercentage().orElse(null),
				training.workoutVolumes().stream()
						.map(volume -> new AnalysisContext.WorkoutVolumeFact(
								volume.workoutId(),
								volume.date(),
								volume.workoutType(),
								volume.totalVolume()))
						.toList(),
				training.personalRecords().stream()
						.map(this::toPersonalRecordFact)
						.toList());
	}

	private AnalysisContext.PersonalRecordFact toPersonalRecordFact(WorkoutAnalyticsSummary.ExercisePersonalRecords records) {
		BigDecimal highestWorkoutExerciseVolume = records.highestTotalVolume()
				.map(WorkoutAnalyticsSummary.ExerciseVolumeRecord::totalVolume)
				.orElse(null);
		return records.highestWeight()
				.map(record -> new AnalysisContext.PersonalRecordFact(
						records.exerciseName(),
						record.weightKg(),
						record.reps(),
						record.volume(),
						highestWorkoutExerciseVolume))
				.orElseGet(() -> new AnalysisContext.PersonalRecordFact(
						records.exerciseName(),
						null,
						null,
						null,
						highestWorkoutExerciseVolume));
	}

	private AnalysisContext.RecentDailyLog toRecentDailyLog(DailyLog log) {
		return new AnalysisContext.RecentDailyLog(
				log.getDate(),
				log.getSleepMinutes() == null ? null : minutesToHours(BigDecimal.valueOf(log.getSleepMinutes())),
				log.getSteps(),
				log.getEnergy(),
				log.getPainNotes(),
				log.getRecoveryNotes());
	}

	private BigDecimal minutesToHours(BigDecimal minutes) {
		return minutes.divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP);
	}

	private AnalysisContext.RecentWorkout toRecentWorkout(Workout workout) {
		return new AnalysisContext.RecentWorkout(
				workout.getId(),
				workout.getDate(),
				workout.getWorkoutType(),
				workout.getStatus(),
				workout.getNotes());
	}

	private List<String> dataGaps(
			BodyAnalyticsSummary body,
			RecoveryAnalyticsSummary recovery,
			WorkoutAnalyticsSummary training,
			List<AnalysisContext.RecentDailyLog> recentDailyLogs,
			List<AnalysisContext.RecentWorkout> recentWorkouts) {
		List<String> gaps = new ArrayList<>();
		if (body.latestWeightKg().isEmpty()) {
			gaps.add("No body weight metrics are available.");
		}
		if (body.sevenDayWeightChangeKg().isEmpty()) {
			gaps.add("Seven-day weight change is unavailable because an exact comparison date is missing.");
		}
		if (recovery.averageSleepMinutes().isEmpty()) {
			gaps.add("Average sleep is unavailable for the current seven-day recovery window.");
		}
		if (recovery.averageSteps().isEmpty()) {
			gaps.add("Average steps are unavailable for the current seven-day recovery window.");
		}
		if (training.adherencePercentage().isEmpty()) {
			gaps.add("Workout adherence is unavailable because no planned workout data exists for the current week.");
		}
		if (recentDailyLogs.isEmpty()) {
			gaps.add("No recent daily logs are available for recovery context.");
		}
		if (recentWorkouts.isEmpty()) {
			gaps.add("No recent workouts are available for training context.");
		}
		return gaps;
	}
}
