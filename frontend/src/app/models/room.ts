export interface Room {
  id: string;
  code: string;
  building: string;
  floor: number;
  number: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomRequest {
  building: string;
  floor: number;
  number: string;
  capacity: number;
}
