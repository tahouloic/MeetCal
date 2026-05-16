export interface School {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolRequest {
  code: string;
  name: string;
  abbreviation: string;
}
