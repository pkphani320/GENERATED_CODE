export interface Organization {
  id?: number;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  active?: boolean;
}
