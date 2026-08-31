CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    sleep_minutes INTEGER,
    steps INTEGER,
    energy VARCHAR(20),
    pain_notes TEXT,
    recovery_notes TEXT,
    estimated_calories INTEGER,
    estimated_protein_grams INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_logs_date UNIQUE (date),
    CONSTRAINT chk_daily_logs_sleep_minutes_non_negative CHECK (sleep_minutes IS NULL OR sleep_minutes >= 0),
    CONSTRAINT chk_daily_logs_steps_non_negative CHECK (steps IS NULL OR steps >= 0),
    CONSTRAINT chk_daily_logs_energy_value CHECK (
        energy IS NULL OR energy IN ('VERY_LOW', 'LOW', 'AVERAGE', 'HIGH', 'VERY_HIGH')
    ),
    CONSTRAINT chk_daily_logs_estimated_calories_non_negative CHECK (estimated_calories IS NULL OR estimated_calories >= 0),
    CONSTRAINT chk_daily_logs_estimated_protein_grams_non_negative CHECK (
        estimated_protein_grams IS NULL OR estimated_protein_grams >= 0
    )
);
