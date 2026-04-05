CREATE TABLE IF NOT EXISTS submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  test_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  score_json  TEXT NOT NULL,
  level       TEXT NOT NULL,
  email_sent  INTEGER DEFAULT 0,
  raw_answers TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_test_name ON submissions(test_name);
CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at);
