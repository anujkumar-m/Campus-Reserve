import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '../../services/bookingService';
import { format } from 'date-fns';

export default function ITApprovalsTab() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch pending approvals for IT resources
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['it-approvals'],
        queryFn: bookingService.getPendingApprovals,
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: bookingService.approve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['it-approvals'] });
            toast({ title: 'Success', description: 'Booking approved successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to approve booking', variant: 'destructive' });
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingService.reject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['it-approvals'] });
            toast({ title: 'Success', description: 'Booking rejected' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reject booking', variant: 'destructive' });
        },
    });

    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this booking?')) {
            approveMutation.mutate(id);
        }
    };

    const handleReject = (id: string) => {
        const reason = prompt('Please enter a reason for rejection:');
        if (reason !== null) {
            rejectMutation.mutate({ id, reason: reason || 'Rejected by IT Admin' });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-warning" />
                        Pending IT Asset Approvals ({bookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading pending approvals...</p>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500 opacity-20 mb-4" />
                            <p className="text-lg font-medium">No pending requests</p>
                            <p className="text-sm text-muted-foreground">All IT resource bookings are up to date.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookings.map((booking: any) => (
                                <Card key={booking.id} className="overflow-hidden border-l-4 border-l-warning">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg">{booking.resourceName}</h4>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {booking.userName} ({booking.userRole})
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">{format(new Date(booking.date), 'EEE, MMM d, yyyy')}</p>
                                                <p className="text-xs text-muted-foreground">{booking.timeSlot.start} - {booking.timeSlot.end}</p>
                                            </div>
                                        </div>

                                        <div className="bg-muted/50 p-2 rounded text-sm mb-4">
                                            <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Purpose</p>
                                            <p>{booking.purpose}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleApprove(booking.id)}
                                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleReject(booking.id)}
                                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
