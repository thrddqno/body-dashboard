package com.antonio.bodydashboard.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "daily_logs")
public class DailyLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private LocalDate date;

	@Column(name = "sleep_minutes")
	private Integer sleepMinutes;

	@Column(name = "steps")
	private Integer steps;

	@Enumerated(EnumType.STRING)
	@Column(name = "energy", length = 20)
	private EnergyLevel energy;

	@Column(name = "pain_notes", columnDefinition = "TEXT")
	private String painNotes;

	@Column(name = "recovery_notes", columnDefinition = "TEXT")
	private String recoveryNotes;

	@Column(name = "estimated_calories")
	private Integer estimatedCalories;

	@Column(name = "estimated_protein_grams")
	private Integer estimatedProteinGrams;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	void prePersist() {
		LocalDateTime now = LocalDateTime.now();
		if (createdAt == null) {
			createdAt = now;
		}
		if (updatedAt == null) {
			updatedAt = now;
		}
	}

	@PreUpdate
	void preUpdate() {
		updatedAt = LocalDateTime.now();
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

	public Integer getSleepMinutes() {
		return sleepMinutes;
	}

	public void setSleepMinutes(Integer sleepMinutes) {
		this.sleepMinutes = sleepMinutes;
	}

	public Integer getSteps() {
		return steps;
	}

	public void setSteps(Integer steps) {
		this.steps = steps;
	}

	public EnergyLevel getEnergy() {
		return energy;
	}

	public void setEnergy(EnergyLevel energy) {
		this.energy = energy;
	}

	public String getPainNotes() {
		return painNotes;
	}

	public void setPainNotes(String painNotes) {
		this.painNotes = painNotes;
	}

	public String getRecoveryNotes() {
		return recoveryNotes;
	}

	public void setRecoveryNotes(String recoveryNotes) {
		this.recoveryNotes = recoveryNotes;
	}

	public Integer getEstimatedCalories() {
		return estimatedCalories;
	}

	public void setEstimatedCalories(Integer estimatedCalories) {
		this.estimatedCalories = estimatedCalories;
	}

	public Integer getEstimatedProteinGrams() {
		return estimatedProteinGrams;
	}

	public void setEstimatedProteinGrams(Integer estimatedProteinGrams) {
		this.estimatedProteinGrams = estimatedProteinGrams;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
