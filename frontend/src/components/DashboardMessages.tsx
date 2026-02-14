import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DashboardMessage } from '../types';
import * as dashboardMessageService from '../services/dashboardMessageService';

export const DashboardMessages: React.FC = () => {
    const queryClient = useQueryClient();
    const [showAll, setShowAll] = useState(false);

    // Fetch messages
    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['dashboard-messages', showAll],
        queryFn: () => dashboardMessageService.getMessages(showAll ? {} : { isRead: false }),
    });

    // Fetch unread count
    const { data: unreadData } = useQuery({
        queryKey: ['dashboard-messages-unread'],
        queryFn: dashboardMessageService.getUnreadCount,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Delete message mutation
    const deleteMutation = useMutation({
        mutationFn: dashboardMessageService.deleteMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-messages'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-messages-unread'] });
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: dashboardMessageService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-messages'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-messages-unread'] });
        },
    });

    const messages: DashboardMessage[] = messagesData?.data || [];
    const unreadCount = unreadData?.count || 0;

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getMessageStyles = (type: string, isRead: boolean) => {
        const baseStyles = "transition-all duration-200 hover:shadow-md";
        const readOpacity = isRead ? "opacity-60" : "";

        switch (type) {
            case 'warning':
                return `${baseStyles} ${readOpacity} border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50`;
            case 'error':
                return `${baseStyles} ${readOpacity} border-l-4 border-red-500 bg-red-50/50 hover:bg-red-50`;
            case 'success':
                return `${baseStyles} ${readOpacity} border-l-4 border-green-500 bg-green-50/50 hover:bg-green-50`;
            default:
                return `${baseStyles} ${readOpacity} border-l-4 border-blue-500 bg-blue-50/50 hover:bg-blue-50`;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'warning':
                return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Warning</Badge>;
            case 'error':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Error</Badge>;
            case 'success':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Success</Badge>;
            default:
                return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Info</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading notifications...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Notifications</CardTitle>
                            {unreadCount > 0 && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                            className="text-xs"
                        >
                            {showAll ? 'Unread Only' : 'Show All'}
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllAsReadMutation.mutate()}
                                disabled={markAllAsReadMutation.isPending}
                                className="text-xs"
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                            <Bell className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                            {showAll ? 'No notifications' : 'No unread notifications'}
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((message: any) => {
                            const messageId = message._id || message.id;
                            return (
                                <div
                                    key={messageId}
                                    className={`p-4 rounded-lg ${getMessageStyles(message.type, message.isRead)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getMessageIcon(message.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getTypeBadge(message.type)}
                                                    {!message.isRead && (
                                                        <Badge variant="default" className="bg-primary text-xs">New</Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(message.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed mb-2">
                                                {message.message}
                                            </p>
                                            {message.bookingId?.resourceId && (
                                                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="font-medium">{message.bookingId.resourceId.name}</span>
                                                    </div>
                                                    {message.bookingId.date && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>{message.bookingId.date}</span>
                                                        </div>
                                                    )}
                                                    {message.bookingId.timeSlot && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>{message.bookingId.timeSlot.start} - {message.bookingId.timeSlot.end}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(messageId)}
                                            disabled={deleteMutation.isPending}
                                            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                            title="Delete notification"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
