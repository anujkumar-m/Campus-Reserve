import api from './api';
import { Booking, BookingStatus } from '@/types';

interface BookingsResponse {
    success: boolean;
    count: number;
    data: Booking[];
}

interface BookingResponse {
    success: boolean;
    data: Booking;
}

interface CreateBookingData {
    resourceId: string;
    date: string;
    timeSlot: {
        start: string;
        end: string;
    };
    purpose: string;
}

export const bookingService = {
    // Get all bookings
    getAll: async (filters?: {
        status?: BookingStatus;
        resourceId?: string;
    }): Promise<Booking[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.resourceId) params.append('resourceId', filters.resourceId);

        const response = await api.get<BookingsResponse>(`/bookings?${params.toString()}`);
        return response.data.data;
    },

    // Get pending bookings
    getPending: async (): Promise<Booking[]> => {
        const response = await api.get<BookingsResponse>('/bookings/pending');
        return response.data.data;
    },

    // Get booking by ID
    getById: async (id: string): Promise<Booking> => {
        const response = await api.get<BookingResponse>(`/bookings/${id}`);
        return response.data.data;
    },

    // Create booking
    create: async (booking: CreateBookingData): Promise<Booking> => {
        const response = await api.post<BookingResponse>('/bookings', booking);
        return response.data.data;
    },

    // Update booking status
    updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
        const response = await api.put<BookingResponse>(`/bookings/${id}/status`, { status });
        return response.data.data;
    },

    // Delete booking
    delete: async (id: string): Promise<void> => {
        await api.delete(`/bookings/${id}`);
    },
};
