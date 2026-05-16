package cm.iusjc.schedule.model.enums;

public enum UserStatus {
    ACTIVE,      // Utilisateur actif (peut se connecter)
    PENDING,     // En attente de validation (professeurs)
    APPROVED,    // Approuvé par admin
    REJECTED,    // Rejeté par admin
    BLOCKED      // Bloqué (trop de tentatives, etc.)
}
