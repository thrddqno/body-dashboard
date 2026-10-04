ALTER TABLE training_plans DROP CONSTRAINT chk_training_plans_workout_type_v2;
ALTER TABLE training_plans ALTER COLUMN workout_type TYPE VARCHAR(20);

UPDATE training_plans
SET workout_type = 'UPPER_A',
    content_json = '{"type":"workout","title":"Upper A","subtitle":"Upper body strength","warmup":[],"exercises":[{"name":"Machine Chest Press","setPrescription":"3 sets"},{"name":"Chest-Supported Row","setPrescription":"3 sets"},{"name":"Incline Dumbbell Press","setPrescription":"3 sets"},{"name":"Lat Pulldown","setPrescription":"3 sets"},{"name":"Lateral Raise","setPrescription":"3 sets"},{"name":"Rope Pressdown","setPrescription":"2 sets"},{"name":"Cable Curl","setPrescription":"2 sets"}],"guardrails":["Generally keep 1-3 reps in reserve on working sets.","Prioritize clean technique and progressive overload."],"optional":[]}'
WHERE day_of_week = 'MONDAY';

UPDATE training_plans
SET workout_type = 'LOWER_A',
    content_json = '{"type":"workout","title":"Lower A","subtitle":"Lower body strength and core","warmup":[],"exercises":[{"name":"Leg Press","setPrescription":"3 sets"},{"name":"Seated Leg Curl","setPrescription":"3 sets"},{"name":"Supported Split Squat","setPrescription":"2-3 sets"},{"name":"Hip Thrust Machine","setPrescription":"3 sets"},{"name":"Calf Raise","setPrescription":"3 sets"},{"name":"Pallof Press","setPrescription":"2-3 sets"}],"guardrails":["Keep technique controlled.","Avoid grinding reps."],"optional":[]}'
WHERE day_of_week = 'TUESDAY';

UPDATE training_plans
SET workout_type = 'REST',
    content_json = '{"type":"rest","title":"Rest","subtitle":"Onsite workday","warmup":[],"exercises":[],"guardrails":["This is an intentional rest day."],"optional":[]}'
WHERE day_of_week = 'WEDNESDAY';

UPDATE training_plans
SET workout_type = 'REST',
    content_json = '{"type":"rest","title":"Rest","subtitle":"Recovery day","warmup":[],"exercises":[],"guardrails":["This is an intentional rest day."],"optional":[]}'
WHERE day_of_week = 'THURSDAY';

UPDATE training_plans
SET workout_type = 'REST',
    content_json = '{"type":"rest","title":"Rest","subtitle":"Onsite workday","warmup":[],"exercises":[],"guardrails":["This is an intentional rest day."],"optional":[]}'
WHERE day_of_week = 'FRIDAY';

UPDATE training_plans
SET workout_type = 'UPPER_B',
    content_json = '{"type":"workout","title":"Upper B","subtitle":"Upper body strength","warmup":[],"exercises":[{"name":"Incline Dumbbell Press","setPrescription":"3 sets"},{"name":"Seated Cable Row","setPrescription":"3 sets"},{"name":"Neutral-Grip Pulldown","setPrescription":"3 sets"},{"name":"Seated Machine Shoulder Press","setPrescription":"2-3 sets"},{"name":"Reverse Pec Deck","setPrescription":"3 sets"},{"name":"Lateral Raise","setPrescription":"2 sets"},{"name":"Rope Pressdown","setPrescription":"2 sets"},{"name":"Cable Curl","setPrescription":"2 sets"}],"guardrails":[],"optional":[]}'
WHERE day_of_week = 'SATURDAY';

UPDATE training_plans
SET workout_type = 'LOWER_B',
    content_json = '{"type":"workout","title":"Lower B","subtitle":"Lower body strength and core","warmup":[],"exercises":[{"name":"Leg Press","setPrescription":"3 sets","notes":"Hack Squat may be used instead."},{"name":"Seated Leg Curl","setPrescription":"3 sets"},{"name":"Leg Extension","setPrescription":"2-3 sets"},{"name":"Hip Thrust Machine","setPrescription":"2-3 sets","notes":"Romanian Deadlift is optional when your back is comfortable. Use Hip Thrust Machine instead if you report back discomfort."},{"name":"Calf Raise","setPrescription":"3 sets"},{"name":"Pallof Press","setPrescription":"2-3 sets","notes":"Another core exercise may be used instead."}],"guardrails":["Do not use Romanian Deadlifts when back discomfort is present."],"optional":["10-20 minutes easy cardio"]}'
WHERE day_of_week = 'SUNDAY';

ALTER TABLE training_plans ADD CONSTRAINT chk_training_plans_workout_type_v3
    CHECK (workout_type IN ('REST', 'UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B', 'FULLBODY'));
