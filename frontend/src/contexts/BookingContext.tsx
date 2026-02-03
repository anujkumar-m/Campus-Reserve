import { createContext, useContext, useState, ReactNode } from 'react';
import { Resource, Booking, BookingStatus } from '@/types';
import { mockResources, mockBookings } from '@/data/mockData';

interface BookingContextType {
  resources: Resource[];
  bookings: Booking[];
  addResource: (resource: Resource) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  getResourceById: (id: string) => Resource | undefined;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByResource: (resourceId: string) => Booking[];
  getPendingBookings: () => Booking[];
  getBookingsByDepartment: (department: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  const addResource = (resource: Resource) => {
    setResources((prev) => [...prev, resource]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const getResourceById = (id: string) => resources.find((r) => r.id === id);

  const getBookingsByUser = (userId: string) =>
    bookings.filter((b) => b.userId === userId);

  const getBookingsByResource = (resourceId: string) =>
    bookings.filter((b) => b.resourceId === resourceId);

  const getPendingBookings = () =>
    bookings.filter((b) => b.status === 'pending');

  const getBookingsByDepartment = (department: string) =>
    bookings.filter((b) => {
      const resource = resources.find((r) => r.id === b.resourceId);
      return resource?.department === department;
    });

  return (
    <BookingContext.Provider
      value={{
        resources,
        bookings,
        addResource,
        updateResource,
        deleteResource,
        addBooking,
        updateBookingStatus,
        getResourceById,
        getBookingsByUser,
        getBookingsByResource,
        getPendingBookings,
        getBookingsByDepartment,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
