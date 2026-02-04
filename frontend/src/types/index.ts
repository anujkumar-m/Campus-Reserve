export type UserRole = 'admin' | 'faculty' | 'student' | 'department' | 'club';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  clubName?: string;
}

export type ResourceType = 'classroom' | 'lab' | 'seminar_hall';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  location: string;
  amenities: string[];
  department?: string;
  isAvailable: boolean;
  image?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string;
  timeSlot: TimeSlot;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  department?: string;
}

export interface DashboardStats {
  totalResources: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
}
