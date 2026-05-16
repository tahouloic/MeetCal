export enum Language {
  FR = 'FR',
  EN = 'EN',
  NONE = 'NONE'
}

export interface ClassGroup {
  id: string;
  code: string;
  name: string;
  level: string;
  language: Language;
  fieldOfStudyId?: string;
  fieldOfStudyName?: string;
  studentCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassGroupRequest {
  fieldOfStudyId: string;
  level: string;
  language: Language;
}
