import api from './api';
import { User } from '@/types';

interface UsersResponse {
    success: boolean;
    count: number;
    data: User[];
}

interface UserResponse {
    success: boolean;
    data: User;
}

export const userService = {
    // Get all users
    getAll: async (): Promise<User[]> => {
        const response = await api.get<UsersResponse>('/users');
        return response.data.data;
    },

    // Alias for getAll
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get<UsersResponse>('/users');
        return response.data.data;
    },

    // Get user by ID
    getById: async (id: string): Promise<User> => {
        const response = await api.get<UserResponse>(`/users/${id}`);
        return response.data.data;
    },

    // Update user
    update: async (id: string, user: Partial<User>): Promise<User> => {
        const response = await api.put<UserResponse>(`/users/${id}`, user);
        return response.data.data;
    },

    // Delete user
    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
