package com.antonio.bodydashboard.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.WeeklyAiAnalysis;

public interface WeeklyAiAnalysisRepository extends JpaRepository<WeeklyAiAnalysis, Long> {

	Optional<WeeklyAiAnalysis> findFirstByOrderByGeneratedAtDescIdDesc();
}
