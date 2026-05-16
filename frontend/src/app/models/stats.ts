// Interface pour les statistiques principales
export interface Stats {
    totalTeachers: number;
    activeTeachers: number;
    pendingTeachers: number;
    rejectedTeachers: number;
    totalUsers: number;
    activeUsers: number;
    schoolStats?: SchoolStats;
}

export interface SchoolStats {
    saintJeanIngenieur: number;
    saintJeanManagement: number;
    prepaVogt: number;
    cpge: number;
}

// Interface pour les activités récentes
export interface Activity {
    id: number;
    description: string;
    time: string;
    isRecent: boolean;
}