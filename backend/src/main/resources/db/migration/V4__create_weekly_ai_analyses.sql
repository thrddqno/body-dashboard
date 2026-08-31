CREATE TABLE weekly_ai_analyses (
    id BIGSERIAL PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    response_json TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_weekly_ai_analyses_generated_at
    ON weekly_ai_analyses (generated_at DESC, id DESC);
