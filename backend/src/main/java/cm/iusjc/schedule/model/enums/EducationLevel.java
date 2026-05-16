package cm.iusjc.schedule.model.enums;

public enum EducationLevel {
    NO_DIPLOMA("Sans diplôme"),
    HIGH_SCHOOL("Baccalauréat"),
    BACHELOR("Licence"),
    MASTER("Master"),
    PHD("Doctorat"),
    OTHER("Autre");
    
    private final String displayName;
    
    EducationLevel(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
