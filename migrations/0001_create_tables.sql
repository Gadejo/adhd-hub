-- Migration: Create all tables for ADHD Hub
-- Created: 2024-01-15

-- Users table for authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    pw_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Resources table
CREATE TABLE resources (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'book', 'course', 'podcast', 'other')),
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    notes TEXT DEFAULT '',
    favorite INTEGER DEFAULT 0 CHECK (favorite IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'reviewing', 'done')),
    next_review_date INTEGER, -- Unix timestamp
    interval_days INTEGER, -- Current spaced repetition interval
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for resources
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_next_review_date ON resources(next_review_date);
CREATE INDEX idx_resources_subject ON resources(subject);

-- Sessions table for study tracking
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    duration_min INTEGER NOT NULL CHECK (duration_min >= 0),
    subject TEXT,
    resource_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL
);

-- Create indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_resource_id ON sessions(resource_id);

-- Goals table
CREATE TABLE goals (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    due_date INTEGER NOT NULL, -- Unix timestamp
    progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for goals
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_due_date ON goals(due_date);
CREATE INDEX idx_goals_status ON goals(status);

-- Settings table for user preferences and stats
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT UNIQUE NOT NULL,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    selected_subject_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for settings
CREATE INDEX idx_settings_user_id ON settings(user_id);

-- Triggers to update updated_at timestamps
CREATE TRIGGER update_resources_updated_at 
AFTER UPDATE ON resources
BEGIN
    UPDATE resources SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TRIGGER update_goals_updated_at 
AFTER UPDATE ON goals
BEGIN
    UPDATE goals SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TRIGGER update_settings_updated_at 
AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Create default settings for new users
CREATE TRIGGER create_default_settings
AFTER INSERT ON users
BEGIN
    INSERT INTO settings (user_id, theme, xp, level, streak, longest_streak)
    VALUES (NEW.id, 'dark', 0, 1, 0, 0);
END;