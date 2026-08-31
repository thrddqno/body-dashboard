package com.antonio.bodydashboard.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.DailyLog;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {

	Optional<DailyLog> findByDate(LocalDate date);

	List<DailyLog> findByDateBetweenOrderByDateAsc(LocalDate start, LocalDate end);

	List<DailyLog> findByOrderByDateDesc(Pageable pageable);
}
