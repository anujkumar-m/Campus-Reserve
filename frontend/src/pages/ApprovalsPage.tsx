import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookingCard } from '@/components/BookingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus, getBookingsByDepartment, getPendingBookings } = useBooking();

  if (!user) return null;

  // Department users see bookings for their department resources
  // Admin sees all pending bookings
  const relevantBookings = user.role === 'department' && user.department
    ? getBookingsByDepartment(user.department)
    : getPendingBookings();

  const pendingBookings = relevantBookings.filter((b) => b.status === 'pending');
  const recentlyProcessed = relevantBookings
    .filter((b) => b.status !== 'pending')
    .slice(0, 5);

  const handleApprove = (id: string) => {
    updateBookingStatus(id, 'approved');
    toast.success('Booking approved');
  };

  const handleReject = (id: string) => {
    updateBookingStatus(id, 'rejected');
    toast.success('Booking rejected');
  };

  const stats = {
    pending: pendingBookings.length,
    approved: relevantBookings.filter((b) => b.status === 'approved').length,
    rejected: relevantBookings.filter((b) => b.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Booking Approvals</h1>
        <p className="text-muted-foreground">
          {user.role === 'department' 
            ? `Review and approve booking requests for ${user.department} resources`
            : 'Review and manage all booking requests'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Pending Requests ({pendingBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  showActions
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Processed */}
      {recentlyProcessed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyProcessed.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
