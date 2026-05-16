package cm.iusjc.schedule.model.enums;

public enum BusinessSector {
    TECHNOLOGY("Technologie"),
    HEALTH("Santé"),
    EDUCATION("Éducation"),
    FINANCE("Finance"),
    RETAIL("Commerce"),
    SERVICES("Services"),
    INDUSTRY("Industrie"),
    AGRICULTURE("Agriculture"),
    CONSTRUCTION("Construction"),
    TRANSPORT("Transport"),
    TOURISM("Tourisme"),
    OTHER("Autre");
    
    private final String displayName;
    
    BusinessSector(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
