package com.antonio.bodydashboard.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutStatus;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

	List<Workout> findAllByOrderByDateDescCreatedAtDesc();

	Page<Workout> findAllByOrderByDateDescCreatedAtDescIdDesc(Pageable pageable);

	List<Workout> findByOrderByDateDescCreatedAtDesc(Pageable pageable);

	Optional<Workout> findFirstByOrderByDateDescIdDesc();

	long countByDateBetweenAndStatus(LocalDate start, LocalDate end, WorkoutStatus status);

	List<Workout> findByDateBetweenOrderByDateAscCreatedAtAsc(LocalDate start, LocalDate end);
}
