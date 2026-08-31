CREATE TABLE body_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    waist_cm NUMERIC(6, 2),
    body_fat_percentage NUMERIC(5, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_body_metrics_date UNIQUE (date),
    CONSTRAINT chk_body_metrics_weight_kg_positive CHECK (weight_kg > 0),
    CONSTRAINT chk_body_metrics_waist_cm_positive CHECK (waist_cm IS NULL OR waist_cm > 0),
    CONSTRAINT chk_body_metrics_body_fat_percentage_range CHECK (
        body_fat_percentage IS NULL OR (body_fat_percentage > 0 AND body_fat_percentage <= 100)
    )
);
