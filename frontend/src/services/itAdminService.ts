import axios from 'axios';
import { Booking, Resource } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Get all IT services bookings
export const getITBookings = async (params?: {
    status?: string;
    date?: string;
    resourceId?: string;
}) => {
    const response = await axios.get(`${API_URL}/it-admin/bookings`, {
        ...getAuthHeader(),
        params,
    });

    // Transform the data to map populated fields
    if (response.data.data) {
        response.data.data = response.data.data.map((booking: any) => ({
            ...booking,
            id: booking._id || booking.id,
            resourceName: booking.resourceId?.name || booking.resourceName,
            userName: booking.userId?.name || booking.userName,
            userRole: booking.userId?.role || booking.userRole,
            userDepartment: booking.userId?.department || booking.userDepartment,
        }));
    }

    return response.data;
};

// Get all IT services resources
export const getITResources = async () => {
    const response = await axios.get(`${API_URL}/it-admin/resources`, getAuthHeader());
    return response.data;
};

// Get conflict warnings
export const getConflicts = async () => {
    const response = await axios.get(`${API_URL}/it-admin/conflicts`, getAuthHeader());
    return response.data;
};

// Reschedule a booking
export const rescheduleBooking = async (
    bookingId: string,
    data: {
        date: string;
        timeSlot: { start: string; end: string };
        resourceId?: string;
        reason: string;
    }
) => {
    const response = await axios.put(
        `${API_URL}/it-admin/bookings/${bookingId}/reschedule`,
        data,
        getAuthHeader()
    );
    return response.data;
};


// Approve a booking
export const approveBooking = async (bookingId: string) => {
    const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/approve-admin`,
        {},
        getAuthHeader()
    );
    return response.data;
};

// Reject a booking
export const rejectBooking = async (bookingId: string, reason: string) => {
    const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/reject-admin`,
        { reason },
        getAuthHeader()
    );
    return response.data;
};

// Get resources
export const getResources = async (params?: any) => {
    const response = await axios.get(`${API_URL}/it-admin/resources`, {
        ...getAuthHeader(),
        params,
    });
    return response.data;
};

// Get stats
export const getStats = async () => {
    const response = await axios.get(`${API_URL}/it-admin/stats`, getAuthHeader());
    return response.data;
};

// Create IT services resource
export const createResource = async (resourceData: Partial<Resource>) => {
    const response = await axios.post(
        `${API_URL}/it-admin/resources`,
        resourceData,
        getAuthHeader()
    );
    return response.data;
};

// Update IT services resource
export const updateResource = async (resourceId: string, resourceData: Partial<Resource>) => {
    const response = await axios.put(
        `${API_URL}/it-admin/resources/${resourceId}`,
        resourceData,
        getAuthHeader()
    );
    return response.data;
};

// Delete IT services resource
export const deleteResource = async (resourceId: string) => {
    const response = await axios.delete(
        `${API_URL}/it-admin/resources/${resourceId}`,
        getAuthHeader()
    );
    return response.data;
};
