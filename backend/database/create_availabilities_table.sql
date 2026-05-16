-- Table des disponibilités des enseignants
CREATE TABLE IF NOT EXISTS availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_day_of_week CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    CONSTRAINT check_time_range CHECK (end_time > start_time)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_availabilities_teacher ON availabilities(teacher_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_day ON availabilities(day_of_week);

-- Commentaires
COMMENT ON TABLE availabilities IS 'Disponibilités des enseignants par jour et créneau horaire';
COMMENT ON COLUMN availabilities.day_of_week IS 'Jour de la semaine (MONDAY, TUESDAY, etc.)';
COMMENT ON COLUMN availabilities.start_time IS 'Heure de début du créneau';
COMMENT ON COLUMN availabilities.end_time IS 'Heure de fin du créneau';
COMMENT ON COLUMN availabilities.is_available IS 'Indique si l enseignant est disponible sur ce créneau';
