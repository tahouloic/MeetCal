package cm.iusjc.schedule.model.enums;

public enum Title {
    NONE("Aucun"),
    ENGINEER("Ingénieur"),
    DOCTOR("Docteur"),
    PROFESSOR("Professeur");
    
    private final String displayName;
    
    Title(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
