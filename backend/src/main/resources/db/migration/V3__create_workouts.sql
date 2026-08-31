CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    workout_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_workouts_status CHECK (status IN ('PLANNED', 'COMPLETED', 'MISSED'))
);

CREATE TABLE workout_exercises (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    CONSTRAINT chk_workout_exercises_order_index_positive CHECK (order_index > 0)
);

CREATE TABLE exercise_sets (
    id BIGSERIAL PRIMARY KEY,
    workout_exercise_id BIGINT NOT NULL REFERENCES workout_exercises (id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg NUMERIC(7, 2) NOT NULL,
    reps INTEGER NOT NULL,
    rir INTEGER,
    warmup BOOLEAN NOT NULL,
    CONSTRAINT chk_exercise_sets_set_number_positive CHECK (set_number > 0),
    CONSTRAINT chk_exercise_sets_weight_kg_non_negative CHECK (weight_kg >= 0),
    CONSTRAINT chk_exercise_sets_reps_positive CHECK (reps > 0),
    CONSTRAINT chk_exercise_sets_rir_range CHECK (rir IS NULL OR (rir >= 0 AND rir <= 10))
);

CREATE INDEX idx_workouts_date ON workouts (date);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises (workout_id);
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets (workout_exercise_id);
