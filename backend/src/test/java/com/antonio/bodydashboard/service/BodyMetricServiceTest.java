package com.antonio.bodydashboard.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import com.antonio.bodydashboard.dto.BodyMetricRequest;
import com.antonio.bodydashboard.exception.DuplicateBodyMetricDateException;
import com.antonio.bodydashboard.repository.BodyMetricRepository;

class BodyMetricServiceTest {

	@Test
	void translatesOnlyTheBodyMetricDateConstraint() {
		BodyMetricRepository repository = mock(BodyMetricRepository.class);
		ConstraintViolationException constraint = mock(ConstraintViolationException.class);
		when(constraint.getConstraintName()).thenReturn("public.\"uq_body_metrics_date\"");
		when(repository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("duplicate", constraint));
		BodyMetricService service = new BodyMetricService(repository);

		assertThatThrownBy(() -> service.create(request()))
				.isInstanceOf(DuplicateBodyMetricDateException.class);
	}

	@Test
	void preservesUnrelatedPersistenceFailures() {
		BodyMetricRepository repository = mock(BodyMetricRepository.class);
		DataIntegrityViolationException failure = new DataIntegrityViolationException("other failure");
		when(repository.saveAndFlush(any())).thenThrow(failure);
		BodyMetricService service = new BodyMetricService(repository);

		assertThatThrownBy(() -> service.create(request())).isSameAs(failure);
	}

	private BodyMetricRequest request() {
		return new BodyMetricRequest(LocalDate.of(2026, 8, 30), new BigDecimal("80.00"), null, null);
	}
}
