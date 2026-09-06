-- Restructure training_plans into a template pool so a FULLBODY plan can exist
-- outside the fixed weekday schedule, then seed the FULLBODY template.
CREATE TABLE training_plans_new (
    id BIGSERIAL PRIMARY KEY,
    day_of_week VARCHAR(9),
    content_json TEXT NOT NULL,
    workout_type VARCHAR(10) NOT NULL,
    CONSTRAINT chk_training_plans_workout_type_v2
        CHECK (workout_type IN ('REST', 'PUSH', 'PULL', 'LEGS', 'UPPER', 'LOWER', 'FULLBODY'))
);

INSERT INTO training_plans_new (day_of_week, content_json, workout_type)
SELECT day_of_week, content_json, workout_type FROM training_plans;

INSERT INTO training_plans_new (day_of_week, content_json, workout_type) VALUES
(NULL, '{"type":"workout","title":"Full Body","subtitle":"Consolidated push, pull, legs, and core","warmup":["5 min easy bike or treadmill","Supported sit-to-stand x 8","One light ramp-up set on leg press and one on the first presses"],"exercises":[{"name":"Leg Press","sets":3,"reps":"8-12","rir":"3-4","rest":"2-3 min","notes":"Use comfortable depth only."},{"name":"Machine Chest Press","sets":2,"reps":"8-12","rir":"3","rest":"2 min"},{"name":"Seated Cable Row","sets":3,"reps":"8-12","rir":"3","rest":"2 min","notes":"Chest-supported if back symptoms recur."},{"name":"Seated Leg Curl","sets":2,"reps":"10-15","rir":"3","rest":"90 sec"},{"name":"Incline Dumbbell Press","sets":2,"reps":"8-12","rir":"3","rest":"2 min"},{"name":"Lat Pulldown","sets":2,"reps":"8-12","rir":"3","rest":"90 sec"},{"name":"Hip Thrust Machine","sets":2,"reps":"8-12","rir":"3","rest":"2 min"},{"name":"Lateral Raise","sets":2,"reps":"12-18","rir":"3","rest":"60 sec"},{"name":"Pallof Press","sets":2,"reps":"8-12 / side","rir":"3","rest":"60 sec"}],"guardrails":["Cover the whole body in one session - 20 work sets is the ceiling, not the target.","Use controlled ranges of motion.","No failure sets.","Do not train through knee or back pain.","If fading, drop lateral raise and Pallof Press sets first.","Stop if dizziness or unusual breathlessness appears."],"optional":[]}', 'FULLBODY');

ALTER TABLE training_plans RENAME TO training_plans_old;
ALTER TABLE training_plans_new RENAME TO training_plans;
DROP TABLE training_plans_old;