export interface Course {
  id: string;
  code: string;
  label: string;
  name: string;
  fieldOfStudyId?: string;
  fieldOfStudyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseRequest {
  label: string;
  fieldOfStudyId: string;
}
