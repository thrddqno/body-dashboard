ALTER TABLE training_plans ADD COLUMN workout_type VARCHAR(10);

UPDATE training_plans
SET workout_type = CASE day_of_week
    WHEN 'MONDAY' THEN 'REST'
    WHEN 'TUESDAY' THEN 'PUSH'
    WHEN 'WEDNESDAY' THEN 'PULL'
    WHEN 'THURSDAY' THEN 'LEGS'
    WHEN 'FRIDAY' THEN 'REST'
    WHEN 'SATURDAY' THEN 'UPPER'
    WHEN 'SUNDAY' THEN 'LOWER'
END;

ALTER TABLE training_plans ALTER COLUMN workout_type SET NOT NULL;
ALTER TABLE training_plans ADD CONSTRAINT chk_training_plans_workout_type
    CHECK (workout_type IN ('REST', 'PUSH', 'PULL', 'LEGS', 'UPPER', 'LOWER'));
