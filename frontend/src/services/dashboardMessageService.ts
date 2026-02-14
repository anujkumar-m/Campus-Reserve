import axios from 'axios';
import { DashboardMessage } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Get all messages for current user
export const getMessages = async (params?: { isRead?: boolean }) => {
    const response = await axios.get(`${API_URL}/dashboard-messages`, {
        ...getAuthHeader(),
        params,
    });

    // Transform data to map _id to id
    if (response.data.data) {
        response.data.data = response.data.data.map((msg: any) => ({
            ...msg,
            id: msg._id || msg.id,
        }));
    }

    return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
    const response = await axios.get(`${API_URL}/dashboard-messages/unread-count`, getAuthHeader());
    return response.data;
};

// Mark a message as read
export const markAsRead = async (messageId: string) => {
    const response = await axios.put(
        `${API_URL}/dashboard-messages/${messageId}/read`,
        {},
        getAuthHeader()
    );
    return response.data;
};

// Mark all messages as read
export const markAllAsRead = async () => {
    const response = await axios.put(
        `${API_URL}/dashboard-messages/read-all`,
        {},
        getAuthHeader()
    );
    return response.data;
};

// Delete a message
export const deleteMessage = async (messageId: string) => {
    const response = await axios.delete(
        `${API_URL}/dashboard-messages/${messageId}`,
        getAuthHeader()
    );
    return response.data;
};
