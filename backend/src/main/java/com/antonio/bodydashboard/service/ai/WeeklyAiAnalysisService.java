package com.antonio.bodydashboard.service.ai;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.WeeklyAiAnalysisResponse;
import com.antonio.bodydashboard.entity.WeeklyAiAnalysis;
import com.antonio.bodydashboard.repository.WeeklyAiAnalysisRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class WeeklyAiAnalysisService {
	private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("EEEE, MMM d, uuuu", Locale.ENGLISH);

	private final AnalysisContextBuilder analysisContextBuilder;
	private final AiProvider aiProvider;
	private final WeeklyAiAnalysisRepository repository;
	private final ObjectMapper objectMapper;

	public WeeklyAiAnalysisService(
			AnalysisContextBuilder analysisContextBuilder,
			AiProvider aiProvider,
			WeeklyAiAnalysisRepository repository,
			ObjectMapper objectMapper) {
		this.analysisContextBuilder = analysisContextBuilder;
		this.aiProvider = aiProvider;
		this.repository = repository;
		this.objectMapper = objectMapper;
	}

	public WeeklyAiAnalysisResponse analyzeCurrentWeek() {
		AnalysisContext context = analysisContextBuilder.buildCurrentDashboardContext();
		WeeklyAiAnalysisResponse response;
		if (hasInsufficientData(context)) {
			response = WeeklyAiAnalysisResponse.insufficientData(knownFactStrings(context), context.dataGaps());
		} else {
			response = toWeeklyResponse(aiProvider.analyze(context), context);
		}

		persist(context, response);
		return response;
	}

	@Transactional(readOnly = true)
	public Optional<WeeklyAiAnalysisResponse> latest() {
		return repository.findFirstByOrderByGeneratedAtDescIdDesc().map(this::deserialize);
	}

	private void persist(AnalysisContext context, WeeklyAiAnalysisResponse response) {
		try {
			WeeklyAiAnalysis entity = new WeeklyAiAnalysis();
			entity.setPeriodStart(context.currentWeek().start());
			entity.setPeriodEnd(context.currentWeek().end());
			entity.setResponseJson(objectMapper.writeValueAsString(response));
			entity.setGeneratedAt(response.generatedAt());
			repository.save(entity);
		} catch (JacksonException exception) {
			throw new IllegalStateException("Unable to persist weekly AI analysis", exception);
		}
	}

	private WeeklyAiAnalysisResponse deserialize(WeeklyAiAnalysis entity) {
		try {
			return normalizeLegacyFacts(objectMapper.readValue(entity.getResponseJson(), WeeklyAiAnalysisResponse.class));
		} catch (JacksonException exception) {
			throw new IllegalStateException("Stored weekly AI analysis is invalid", exception);
		}
	}

	private WeeklyAiAnalysisResponse normalizeLegacyFacts(WeeklyAiAnalysisResponse response) {
		List<String> knownFacts = response.knownFacts().stream().map(this::normalizeLegacyFact).toList();
		return new WeeklyAiAnalysisResponse(
				response.summary(),
				knownFacts,
				response.interpretation(),
				response.strengths(),
				response.concerns(),
				response.recommendations(),
				response.dataGaps(),
				response.generatedAt());
	}

	private String normalizeLegacyFact(String fact) {
		try {
			String periodPrefix = "Analysis period: ";
			if (fact.startsWith(periodPrefix)) {
				String[] dates = fact.substring(periodPrefix.length()).split(" to ", 2);
				if (dates.length == 2) {
					return periodPrefix + DISPLAY_DATE.format(LocalDate.parse(dates[0]))
							+ " to " + DISPLAY_DATE.format(LocalDate.parse(dates[1]));
				}
			}

			String sleepPrefix = "Average sleep: ";
			String minutesSuffix = " minutes";
			if (fact.startsWith(sleepPrefix) && fact.endsWith(minutesSuffix)) {
				String minutes = fact.substring(sleepPrefix.length(), fact.length() - minutesSuffix.length());
				BigDecimal hours = new BigDecimal(minutes).divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP);
				return sleepPrefix + hours + " hours";
			}
		} catch (RuntimeException ignored) {
			// Preserve older stored text if it does not match the application-owned legacy format.
		}
		return fact;
	}

	private WeeklyAiAnalysisResponse toWeeklyResponse(AnalysisResult result, AnalysisContext context) {
		return new WeeklyAiAnalysisResponse(
				result.summary(),
				knownFactStrings(context),
				result.interpretation(),
				result.strengths(),
				result.concerns(),
				result.recommendations(),
				context.dataGaps(),
				result.generatedAt());
	}

	private boolean hasInsufficientData(AnalysisContext context) {
		return context.body().latestWeightKg() == null
				&& context.recovery().averageSleepHours() == null
				&& context.recovery().averageSteps() == null
				&& context.training().completedWorkoutsThisWeek() == 0
				&& context.training().missedWorkoutsThisWeek() == 0
				&& context.recentDailyLogs().isEmpty()
				&& context.recentWorkouts().isEmpty();
	}

	private List<String> knownFactStrings(AnalysisContext context) {
		List<String> facts = new ArrayList<>();
		facts.add("Analysis period: " + DISPLAY_DATE.format(context.currentWeek().start()) + " to " + DISPLAY_DATE.format(context.currentWeek().end()));
		addIfPresent(facts, "Latest weight", context.body().latestWeightKg(), "kg");
		addIfPresent(facts, "Seven-day weight change", context.body().sevenDayWeightChangeKg(), "kg");
		addIfPresent(facts, "Thirty-day weight change", context.body().thirtyDayWeightChangeKg(), "kg");
		addIfPresent(facts, "Average sleep", context.recovery().averageSleepHours(), "hours");
		addIfPresent(facts, "Average steps", context.recovery().averageSteps(), "steps");
		facts.add("Completed workouts: " + context.training().completedWorkoutsThisWeek());
		facts.add("Missed workouts: " + context.training().missedWorkoutsThisWeek());
		addIfPresent(facts, "Adherence", context.training().adherencePercentage(), "%");
		return facts;
	}

	private void addIfPresent(List<String> facts, String label, Object value, String unit) {
		if (value != null) {
			facts.add(label + ": " + value + " " + unit);
		}
	}
}
