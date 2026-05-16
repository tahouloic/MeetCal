// Modèles pour le système de gestion des emplois du temps

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  teacherId: string;
  specialty: string;
  schools: School[];
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface TeacherApplication {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    title?: string;
    profilePicture?: string;
    role: UserRole;
    status: UserStatus;
    lastConnection?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  specialty: string;
  schools: School[];
  isActive: boolean;
  isApproved: boolean;
  rejectionReason?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format HH:mm
  endTime: string;   // Format HH:mm
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  equipment: Equipment[];
  isActive: boolean;
  location: string;
}

export interface Schedule {
  id: string;
  teacherId: string;
  roomId: string;
  subject: string;
  school: School;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  studentGroup: string;
  courseType: CourseType;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Nouveaux modèles pour la génération d'emplois du temps
export interface WeeklySchedule {
  id: string;
  weekNumber: number;
  year: number;
  weekStartDate: string;
  classGroupId: string;
  classGroupName: string;
  timeSlots: TimeSlot[];
  isGenerated: boolean;
  isPublished: boolean;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  roomId: string;
  roomCode: string;
  roomCapacity: number;
  isManuallySet: boolean;
}

export interface GenerateScheduleRequest {
  classGroupId: string;
  weekNumber: number;
  year: number;
}

export interface CreateTimeSlotRequest {
  scheduleId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  courseId: string;
  teacherId: string;
  roomId: string;
}

export interface UpdateTimeSlotRequest {
  courseId: string;
  teacherId: string;
  roomId: string;
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum School {
  SJI = 'SJI',
  SJM = 'SJM',
  PREPA_VOGT = 'PREPA_VOGT',
  CPGE = 'CPGE'
}

export enum RoomType {
  CLASSROOM = 'CLASSROOM',
  LABORATORY = 'LABORATORY',
  AMPHITHEATER = 'AMPHITHEATER',
  CONFERENCE_ROOM = 'CONFERENCE_ROOM'
}

export enum CourseType {
  LECTURE = 'LECTURE',        // Cours magistral
  TUTORIAL = 'TUTORIAL',      // Travaux dirigés
  PRACTICAL = 'PRACTICAL'     // Travaux pratiques
}

export enum Equipment {
  PROJECTOR = 'PROJECTOR',
  COMPUTER = 'COMPUTER',
  SPEAKERS = 'SPEAKERS',
  WHITEBOARD = 'WHITEBOARD',
  LABORATORY_EQUIPMENT = 'LABORATORY_EQUIPMENT'
}

// DTOs pour les requêtes
export interface TeacherRegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  schools: School[];
  phoneNumber?: string;
  profilePicture?: File;
}

export interface AvailabilityRequest {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface TeacherApplicationReview {
  applicationId: string;
  status: ApplicationStatus;
  rejectionReason?: string;
}

// Réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}