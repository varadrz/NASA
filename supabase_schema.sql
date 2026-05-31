-- Supabase SQL Schema for NASA Hyderabad Heritage Quiz Hunt
-- Location: Root directory (supabase_schema.sql)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS participant_progress CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS participants CASCADE;

-- 1. Participants Table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    instagram_id VARCHAR(100) NULL,
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Quizzes Table (Corresponds to 10 Barrels)
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrel_id INTEGER UNIQUE NOT NULL CHECK (barrel_id BETWEEN 1 AND 10),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- 3. Questions Table (Pool of 20 per quiz)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D'))
);

-- 4. Quiz Attempts Table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    time_taken_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Participant Progress Table
CREATE TABLE participant_progress (
    participant_id UUID PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
    completed_quizzes INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- accumulated time_taken_seconds
    next_barrel_id INTEGER NULL CHECK (next_barrel_id IS NULL OR next_barrel_id BETWEEN 1 AND 10),
    current_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
    peer_targets JSONB DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and sorting
CREATE INDEX idx_participants_registration_id ON participants(registration_id);
CREATE INDEX idx_quizzes_barrel_id ON quizzes(barrel_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_quiz_attempts_participant_quiz ON quiz_attempts(participant_id, quiz_id);
CREATE INDEX idx_leaderboard_sorting ON participant_progress(total_score DESC, total_time ASC);

-- -------------------------------------------------------------
-- Seed Data for 10 Quizzes (Barrels 1 to 10)
-- -------------------------------------------------------------

INSERT INTO quizzes (barrel_id, title, description) VALUES
(1, 'Ancient Wonders & Egypt', 'Explore the structural genius, monumental masonry, and alignment of Giza, Luxor, and ancient dry-stone monuments.'),
(2, 'Classical Greek & Roman', 'Examine the proportions of Greek orders and the revolutionary concrete and vaulting systems of the Roman Empire.'),
(3, 'Gothic Cathedrals & Medieval Europe', 'Investigate structural engineering breakthroughs: pointed arches, flying buttresses, and rib vaulting.'),
(4, 'Renaissance & Baroque Masterpieces', 'Analyze the revival of classicism, perspective, and the dramatic curves and optical illusions of the Baroque period.'),
(5, 'Islamic & Indian Marvels', 'Explore the structural engineering and spatial layouts of Islamic domes, Taj Mahal, and South Indian temple gopurams.'),
(6, 'East Asian Temple Architecture', 'Discover the wooden joinery systems, bracket complexes, and pagodas of China, Japan, and Southeast Asia.'),
(7, 'Pre-Columbian & Mesoamerican', 'Explore the stone carving, dry-stone masonry, and solar alignments of the Maya, Aztecs, and Incas.'),
(8, 'Modernism & Bauhaus Movement', 'Analyze the architectural philosophies of Le Corbusier, Frank Lloyd Wright, Mies van der Rohe, and Walter Gropius.'),
(9, 'Postmodern & Contemporary Giants', 'Explore the reactions against modernism, deconstructivism, and iconic landmarks of the late 20th and early 21st century.'),
(10, 'Sustainable & Vernacular Structures', 'Discover passive heating and cooling, organic building materials, and cutting-edge ecological architecture designs.');

-- We will insert a comprehensive set of 200 architectural questions in the application initialization or direct DB seed.
-- For the SQL schema script, we will define 2-3 sample questions per quiz, and then write a seed router/api to load all 200 questions to avoid huge SQL command executions.
