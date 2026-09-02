package com.antonio.bodydashboard.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Component;

/**
 * Application-owned fitness goal configuration.
 *
 * <p>The weight goal is staged. Stage 1 (active milestone) is 104 kg. Stage 2
 * (100-101 kg) is not automatically active and only becomes relevant after
 * reassessing progress around 104 kg. There is no final target below that
 * range unless explicitly configured later.
 *
 * <p>Nutrition values have different meanings: the calorie target is the
 * configured fat-loss intake level; the maintenance figures are only an
 * estimated range and must not be treated as measured or used to
 * automatically adjust the calorie target.
 */
@Component
public class FitnessGoals {

	public static final LocalDate BASELINE_DATE = LocalDate.of(2026, 9, 2);
	public static final BigDecimal BASELINE_WEIGHT_KG = new BigDecimal("113.1");

	public static final BigDecimal STAGE_1_TARGET_KG = new BigDecimal("104");
	public static final BigDecimal STAGE_2_MIN_KG = new BigDecimal("100");
	public static final BigDecimal STAGE_2_MAX_KG = new BigDecimal("101");

	public static final int CALORIE_TARGET_KCAL = 2500;
	public static final int ESTIMATED_MAINTENANCE_MIN_KCAL = 3000;
	public static final int ESTIMATED_MAINTENANCE_MAX_KCAL = 3300;

	public static final BigDecimal MIN_WEIGHT_LOSS_KG_PER_WEEK = new BigDecimal("0.5");
	public static final BigDecimal MAX_WEIGHT_LOSS_KG_PER_WEEK = new BigDecimal("0.8");

	public BigDecimal activeTargetKg() {
		return STAGE_1_TARGET_KG;
	}

	public BigDecimal stage2MinKg() {
		return STAGE_2_MIN_KG;
	}

	public BigDecimal stage2MaxKg() {
		return STAGE_2_MAX_KG;
	}
}
