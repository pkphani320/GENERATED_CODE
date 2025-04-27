export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roles?: string[];
  organizationId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
