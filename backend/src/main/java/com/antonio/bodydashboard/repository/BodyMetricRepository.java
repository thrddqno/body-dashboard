package com.antonio.bodydashboard.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.BodyMetric;

public interface BodyMetricRepository extends JpaRepository<BodyMetric, Long> {

	boolean existsByDate(LocalDate date);

	List<BodyMetric> findAllByOrderByDateDesc();

	List<BodyMetric> findByOrderByDateDesc(Pageable pageable);

	List<BodyMetric> findByDateBetweenOrderByDateAsc(LocalDate start, LocalDate end);
}
