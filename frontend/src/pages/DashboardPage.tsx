import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BookingCard } from '@/components/BookingCard';
import { ResourceCard } from '@/components/ResourceCard';
import { DashboardMessages } from '@/components/DashboardMessages';

export default function DashboardPage() {
  const { user } = useAuth();
  const { resources, bookings, getBookingsByUser, getPendingBookings, getBookingsByDepartment } = useBooking();

  if (!user) return null;

  const userBookings = getBookingsByUser(user.id);
  const pendingBookings = getPendingBookings();
  const departmentBookings = user.department ? getBookingsByDepartment(user.department) : [];

  const stats = {
    totalResources: resources.length,
    availableResources: resources.filter((r) => r.isAvailable).length,
    totalBookings: (user.role === 'infra_admin' || user.role === 'it_admin') ? bookings.length : userBookings.length,
    pendingCount: (user.role === 'infra_admin' || user.role === 'it_admin' || user.role === 'department')
      ? pendingBookings.length
      : userBookings.filter((b) => b.status === 'pending_hod' || b.status === 'pending_admin').length,
    approvedCount: (user.role === 'infra_admin' || user.role === 'it_admin')
      ? bookings.filter((b) => b.status === 'approved').length
      : userBookings.filter((b) => b.status === 'approved').length,
    rejectedCount: userBookings.filter((b) => b.status === 'rejected').length,
  };

  const recentBookings = (user.role === 'infra_admin' || user.role === 'it_admin')
    ? bookings.slice(0, 3)
    : user.role === 'department'
      ? departmentBookings.slice(0, 3)
      : userBookings.slice(0, 3);

  const featuredResources = resources.filter((r) => r.isAvailable).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'infra_admin' && 'Manage infrastructure resources and facility bookings.'}
          {user.role === 'it_admin' && 'Manage IT equipment and movable resource bookings.'}
          {user.role === 'faculty' && 'Book classrooms and labs for your lectures.'}
          {user.role === 'department' && 'Manage department resources and approve requests.'}
          {user.role === 'club' && 'Book venues for your upcoming club events.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Resources</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.availableResources}</p>
                <p className="text-xs text-muted-foreground mt-1">of {stats.totalResources} total</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {(user.role === 'infra_admin' || user.role === 'it_admin') ? 'Total Bookings' : 'Your Bookings'}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalBookings}</p>
                <p className="text-xs text-muted-foreground mt-1">all time</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">awaiting approval</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card card-interactive">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.approvedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">confirmed bookings</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Messages */}
      <DashboardMessages />

      {/* Recent Activity & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {(user.role === 'infra_admin' || user.role === 'it_admin') ? 'Recent Bookings' :
                user.role === 'department' ? 'Department Requests' :
                  'Your Recent Bookings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} compact />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No bookings yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Resources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Available Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} compact />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
