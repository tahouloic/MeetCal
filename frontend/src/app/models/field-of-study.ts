import { School } from './school';

export interface FieldOfStudy {
  id: string;
  code: string;
  label: string;
  school: School;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldOfStudyRequest {
  label: string;
  schoolId: string;
}
