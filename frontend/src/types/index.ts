export type UserRole = 'infra_admin' | 'it_admin' | 'faculty' | 'student' | 'department' | 'club';

export interface User {
  id: string;
  _id?: string; // MongoDB ID from backend
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  clubName?: string;
  isActive?: boolean;
}

export type ResourceType =
  | 'classroom'
  | 'lab'
  | 'department_library'
  | 'department_seminar_hall'
  | 'central_seminar_hall'
  | 'auditorium'
  | 'conference_room'
  | 'bus'
  | 'projector'
  | 'camera'
  | 'sound_system'
  | 'other_equipment'
  | 'others';

export type ResourceCategory = 'department' | 'central' | 'movable_asset';

export type ResourceManagedBy = 'infrastructure' | 'it_services';

export interface ResourceTimeSlot {
  label: string;
  duration: number; // in hours
  isDefault?: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  category: ResourceCategory;
  capacity: number;
  location: string;
  amenities: string[];
  department?: string;
  isAvailable: boolean;
  requiresApproval?: boolean;
  maxBookingDuration?: number;
  customType?: string; // For when type is 'others'
  image?: string;
  availableTimeSlots?: ResourceTimeSlot[];
  managedBy?: ResourceManagedBy; // Which admin department manages this resource
  isMovable?: boolean;
}

export type BookingStatus =
  | 'auto_approved'
  | 'pending_hod'
  | 'pending_admin'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'rescheduled';

export type ApprovalLevel = 'none' | 'hod' | 'admin';

export type BookingType =
  | 'regular'
  | 'remedial'
  | 'project'
  | 'event'
  | 'industrial_visit'
  | 'other';

export interface BookingTimeSlot {
  start: string;
  end: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType?: ResourceType;
  resourceCategory?: ResourceCategory;
  userId: string;
  userName: string;
  userRole: UserRole;
  userDepartment?: string;
  date: string;
  timeSlot: BookingTimeSlot;
  duration: number;
  purpose: string;
  bookingType: BookingType;
  status: BookingStatus;
  requiresApproval: boolean;
  approvalLevel: ApprovalLevel;
  approvedBy?: {
    id: string;
    name: string;
    role: UserRole;
  };
  approvedAt?: string;
  rejectedBy?: {
    id: string;
    name: string;
    role: UserRole;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  rescheduledBy?: {
    id: string;
    name: string;
    role: UserRole;
  };
  rescheduledAt?: string;
  rescheduleReason?: string;
  conflictWarning?: boolean;
  createdAt: string;
  department?: string;
}

export interface DashboardStats {
  totalResources: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  autoApprovedBookings?: number;
  rejectedBookings?: number;
}

export type DashboardMessageType = 'info' | 'warning' | 'success' | 'error';

export interface DashboardMessage {
  id: string;
  userId: string;
  bookingId?: string;
  message: string;
  type: DashboardMessageType;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

