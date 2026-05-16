-- Migration: Créer la table de liaison teacher_courses
-- Raison: Permettre aux enseignants d'enseigner plusieurs cours
-- Date: 2026-03-09

-- Créer la table de liaison many-to-many
CREATE TABLE IF NOT EXISTS teacher_courses (
    teacher_id UUID NOT NULL,
    course_id UUID NOT NULL,
    PRIMARY KEY (teacher_id, course_id),
    CONSTRAINT fk_teacher_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_teacher_courses_teacher ON teacher_courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_courses_course ON teacher_courses(course_id);

-- Vérifier la structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teacher_courses' 
ORDER BY ordinal_position;
