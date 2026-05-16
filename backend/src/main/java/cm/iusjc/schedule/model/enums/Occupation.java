package cm.iusjc.schedule.model.enums;

public enum Occupation {
    STUDENT("Étudiant"),
    EMPLOYEE("Employé"),
    SELF_EMPLOYED("Indépendant"),
    UNEMPLOYED("Sans emploi"),
    RETIRED("Retraité"),
    OTHER("Autre");
    
    private final String displayName;
    
    Occupation(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
