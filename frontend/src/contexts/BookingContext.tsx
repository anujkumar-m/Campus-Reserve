import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resource, Booking, BookingStatus } from '@/types';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';

interface BookingContextType {
  resources: Resource[];
  bookings: Booking[];
  isLoadingResources: boolean;
  isLoadingBookings: boolean;
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  addBooking: (booking: any) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByResource: (resourceId: string) => Booking[];
  getPendingBookings: () => Booking[];
  getBookingsByDepartment: (department: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get authentication token to check if user is logged in
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // Fetch resources - only when authenticated
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => resourceService.getAll(),
    enabled: isAuthenticated, // Only fetch when user is logged in
  });

  // Fetch bookings - only when authenticated
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll(),
    enabled: isAuthenticated, // Only fetch when user is logged in
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: (resource: Omit<Resource, 'id'>) => resourceService.create(resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({ title: 'Success', description: 'Resource created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create resource', variant: 'destructive' });
    },
  });

  // Update resource mutation
  const updateResourceMutation = useMutation({
    mutationFn: ({ id, resource }: { id: string; resource: Partial<Resource> }) =>
      resourceService.update(id, resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({ title: 'Success', description: 'Resource updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update resource', variant: 'destructive' });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => resourceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({ title: 'Success', description: 'Resource deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete resource', variant: 'destructive' });
    },
  });

  // Add booking mutation
  const addBookingMutation = useMutation({
    mutationFn: (booking: any) => bookingService.create(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: 'Success', description: 'Booking created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create booking', variant: 'destructive' });
    },
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: 'Success', description: 'Booking status updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update booking status', variant: 'destructive' });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: (id: string) => bookingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({ title: 'Success', description: 'Booking cancelled successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to cancel booking', variant: 'destructive' });
    },
  });

  const getResourceById = (id: string) => resources.find((r) => r.id === id);
  const getBookingsByUser = (userId: string) => bookings.filter((b) => b.userId === userId);
  const getBookingsByResource = (resourceId: string) => bookings.filter((b) => b.resourceId === resourceId);
  const getPendingBookings = () => bookings.filter((b) => b.status === 'pending');
  const getBookingsByDepartment = (department: string) =>
    bookings.filter((b) => b.department === department);

  return (
    <BookingContext.Provider
      value={{
        resources,
        bookings,
        isLoadingResources,
        isLoadingBookings,
        addResource: async (resource) => { await addResourceMutation.mutateAsync(resource); },
        updateResource: async (id, resource) => { await updateResourceMutation.mutateAsync({ id, resource }); },
        deleteResource: async (id) => { await deleteResourceMutation.mutateAsync(id); },
        addBooking: async (booking) => { await addBookingMutation.mutateAsync(booking); },
        updateBookingStatus: async (id, status) => { await updateBookingStatusMutation.mutateAsync({ id, status }); },
        deleteBooking: async (id) => { await deleteBookingMutation.mutateAsync(id); },
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
