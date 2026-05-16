package cm.iusjc.schedule.model.enums;

public enum School {
    SJI("Saint Jean Ingénieur"),
    SJM("Saint Jean Management"),
    PREPA_VOGT("PrépaVogt"),
    CPGE("CPGE");
    
    private final String displayName;
    
    School(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
