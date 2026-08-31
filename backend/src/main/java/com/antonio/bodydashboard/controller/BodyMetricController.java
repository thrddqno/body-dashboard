package com.antonio.bodydashboard.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.antonio.bodydashboard.dto.BodyMetricRequest;
import com.antonio.bodydashboard.dto.BodyMetricResponse;
import com.antonio.bodydashboard.service.BodyMetricService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/body-metrics")
public class BodyMetricController {

	private final BodyMetricService bodyMetricService;

	public BodyMetricController(BodyMetricService bodyMetricService) {
		this.bodyMetricService = bodyMetricService;
	}

	@PostMapping
	public ResponseEntity<BodyMetricResponse> create(@Valid @RequestBody BodyMetricRequest request) {
		BodyMetricResponse response = bodyMetricService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(response.id())
				.toUri();
		return ResponseEntity.created(location).body(response);
	}

	@GetMapping
	public List<BodyMetricResponse> listBodyMetrics() {
		return bodyMetricService.getAll();
	}

	@GetMapping("/{id}")
	public BodyMetricResponse findBodyMetric(@PathVariable Long id) {
		return bodyMetricService.getById(id);
	}
}
