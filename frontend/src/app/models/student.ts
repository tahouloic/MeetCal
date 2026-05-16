import { ClassGroup } from './class-group';
import { SchoolEnum } from './school.enum';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  school: SchoolEnum;
  classGroup: ClassGroup;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  classGroupId: string;
  school: SchoolEnum;
}

export interface StudentImportResponse {
  successCount: number;
  errorCount: number;
  errors: string[];
  students: Student[];
}
