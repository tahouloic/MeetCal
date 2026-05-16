package cm.iusjc.schedule.model.enums;

public enum LegalStatus {
    SOLE_PROPRIETORSHIP("Entreprise individuelle"),
    LLC("SARL"),
    CORPORATION("SA"),
    PARTNERSHIP("SNC"),
    COOPERATIVE("Coopérative"),
    ASSOCIATION("Association"),
    NGO("ONG"),
    OTHER("Autre");
    
    private final String displayName;
    
    LegalStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
