import { Booking } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  compact?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusStyles = {
  pending: 'status-pending border',
  approved: 'status-approved border',
  rejected: 'status-rejected border',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function BookingCard({ booking, compact = false, showActions, onApprove, onReject }: BookingCardProps) {
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
        <Badge variant="outline" className={cn('shrink-0', statusStyles[booking.status])}>
          {statusLabels[booking.status]}
        </Badge>
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
          <Badge variant="outline" className={statusStyles[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.timeSlot.start} - {booking.timeSlot.end}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <User className="h-4 w-4" />
            <span>{booking.userName}</span>
          </div>
        </div>

        {showActions && booking.status === 'pending' && (
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
      </CardContent>
    </Card>
  );
}
