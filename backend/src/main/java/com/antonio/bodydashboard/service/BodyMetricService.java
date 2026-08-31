package com.antonio.bodydashboard.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.BodyMetricRequest;
import com.antonio.bodydashboard.dto.BodyMetricResponse;
import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.exception.BodyMetricNotFoundException;
import com.antonio.bodydashboard.exception.DuplicateBodyMetricDateException;
import com.antonio.bodydashboard.exception.PersistenceConstraintViolation;
import com.antonio.bodydashboard.repository.BodyMetricRepository;

@Service
public class BodyMetricService {

	private final BodyMetricRepository bodyMetricRepository;

	public BodyMetricService(BodyMetricRepository bodyMetricRepository) {
		this.bodyMetricRepository = bodyMetricRepository;
	}

	@Transactional
	public BodyMetricResponse create(BodyMetricRequest request) {
		if (bodyMetricRepository.existsByDate(request.date())) {
			throw new DuplicateBodyMetricDateException(request.date());
		}

		BodyMetric bodyMetric = new BodyMetric();
		bodyMetric.setDate(request.date());
		bodyMetric.setWeightKg(request.weightKg());
		bodyMetric.setWaistCm(request.waistCm());
		bodyMetric.setBodyFatPercentage(request.bodyFatPercentage());

		try {
			return toResponse(bodyMetricRepository.saveAndFlush(bodyMetric));
		} catch (DataIntegrityViolationException exception) {
			if (PersistenceConstraintViolation.isConstraint(exception, "uq_body_metrics_date")) {
				throw new DuplicateBodyMetricDateException(request.date());
			}
			throw exception;
		}
	}

	@Transactional(readOnly = true)
	public List<BodyMetricResponse> getAll() {
		return bodyMetricRepository.findAllByOrderByDateDesc()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public BodyMetricResponse getById(Long id) {
		return bodyMetricRepository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new BodyMetricNotFoundException(id));
	}

	private BodyMetricResponse toResponse(BodyMetric bodyMetric) {
		return new BodyMetricResponse(
				bodyMetric.getId(),
				bodyMetric.getDate(),
				bodyMetric.getWeightKg(),
				bodyMetric.getWaistCm(),
				bodyMetric.getBodyFatPercentage(),
				bodyMetric.getCreatedAt());
	}
}
