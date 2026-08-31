package com.antonio.bodydashboard.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "body_metrics")
public class BodyMetric {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private LocalDate date;

	@Column(name = "weight_kg", nullable = false, precision = 6, scale = 2)
	private BigDecimal weightKg;

	@Column(name = "waist_cm", precision = 6, scale = 2)
	private BigDecimal waistCm;

	@Column(name = "body_fat_percentage", precision = 5, scale = 2)
	private BigDecimal bodyFatPercentage;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	void prePersist() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public void setWeightKg(BigDecimal weightKg) {
		this.weightKg = weightKg;
	}

	public BigDecimal getWaistCm() {
		return waistCm;
	}

	public void setWaistCm(BigDecimal waistCm) {
		this.waistCm = waistCm;
	}

	public BigDecimal getBodyFatPercentage() {
		return bodyFatPercentage;
	}

	public void setBodyFatPercentage(BigDecimal bodyFatPercentage) {
		this.bodyFatPercentage = bodyFatPercentage;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
