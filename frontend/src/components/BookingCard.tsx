import { Booking } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Calendar, Clock, MapPin, User, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  compact?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showCancel?: boolean;
  onCancel?: (id: string) => void;
}

export function BookingCard({
  booking,
  compact = false,
  showActions,
  onApprove,
  onReject,
  showCancel,
  onCancel
}: BookingCardProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{booking.resourceName}</p>
            <p className="text-xs text-muted-foreground">
              {booking.date} • {booking.timeSlot.start} - {booking.timeSlot.end}
            </p>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>
    );
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{booking.resourceName}</h3>
            <p className="text-sm text-muted-foreground">{booking.purpose}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.timeSlot.start} - {booking.timeSlot.end}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{booking.userName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.duration}h duration</span>
          </div>
        </div>

        {/* Show rejection reason if rejected */}
        {booking.status === 'rejected' && booking.rejectionReason && (
          <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs font-medium text-destructive mb-1">Rejection Reason:</p>
            <p className="text-xs text-muted-foreground">{booking.rejectionReason}</p>
          </div>
        )}

        {/* Approval actions for HOD/Admin */}
        {showActions && (booking.status === 'pending_hod' || booking.status === 'pending_admin') && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={() => onApprove?.(booking.id)}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onReject?.(booking.id)}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {/* Cancel button for user's own bookings */}
        {showCancel && onCancel && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={() => onCancel(booking.id)}
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
