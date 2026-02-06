import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookingType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Building2, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resources, addBooking, getResourceById } = useBooking();
  const { user } = useAuth();

  const preselectedResourceId = searchParams.get('resource');

  const [selectedResourceId, setSelectedResourceId] = useState(preselectedResourceId || '');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('regular');

  const selectedResource = selectedResourceId ? getResourceById(selectedResourceId) : null;
  const availableResources = resources.filter((r) => r.isAvailable);

  // Calculate duration in hours
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  };

  const duration = calculateDuration();

  // Get available booking types based on user role
  const getAvailableBookingTypes = () => {
    if (user?.role === 'student') {
      return [
        { value: 'regular', label: 'Regular' },
        { value: 'project', label: 'Project Work' },
        { value: 'others', label: 'Others' },
      ];
    }
    return [
      { value: 'regular', label: 'Regular' },
      { value: 'remedial', label: 'Remedial Class' },
      { value: 'project', label: 'Project Work' },
      { value: 'event', label: 'Event' },
      { value: 'industrial_visit', label: 'Industrial Visit' },
      { value: 'others', label: 'Others' },
    ];
  };

  useEffect(() => {
    if (preselectedResourceId) {
      setSelectedResourceId(preselectedResourceId);
    }
  }, [preselectedResourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResource || !date || !startTime || !endTime || !purpose || !user) {
      toast.error('Please fill in all fields');
      return;
    }

    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const booking = {
      resourceId: selectedResource.id,
      date: format(date, 'yyyy-MM-dd'),
      timeSlot: {
        start: startTime,
        end: endTime,
      },
      purpose,
      bookingType,
    };

    addBooking(booking);
    toast.success('Booking request submitted successfully');
    navigate('/my-bookings');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.role === 'student' ? 'Request Booking' :
            user?.role === 'club' ? 'Book Venue' : 'Book Resource'}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'student'
            ? 'Submit a booking request for approval'
            : user?.role === 'faculty'
              ? 'Reserve a resource for your class'
              : 'Book a venue for your event'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Fill in the details for your booking request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Selection */}
              <div className="space-y-2">
                <Label>Select Resource</Label>
                <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resource..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableResources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} • {resource.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Range Selection */}
              <div className="space-y-2">
                <Label>Select Time Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm text-muted-foreground">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm text-muted-foreground">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {duration > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Duration: <span className="font-medium text-foreground">{duration} hour{duration !== 1 ? 's' : ''}</span>
                  </p>
                )}
                {duration < 0 && (
                  <p className="text-sm text-destructive">
                    End time must be after start time
                  </p>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your booking..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Booking Type */}
              <div className="space-y-2">
                <Label>Booking Type</Label>
                <Select value={bookingType} onValueChange={(value) => setBookingType(value as BookingType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableBookingTypes().map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg">
                {user?.role === 'faculty' ? 'Confirm Booking' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resource Preview */}
        <div className="space-y-4">
          {selectedResource ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Resource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedResource.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedResource.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedResource.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {selectedResource.capacity}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a resource to see details</p>
              </CardContent>
            </Card>
          )}

          {/* Booking Summary */}
          {date && startTime && endTime && duration > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <h4 className="font-medium text-foreground mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📅 {format(date, 'EEEE, MMMM d, yyyy')}</p>
                  <p>🕐 {startTime} - {endTime}</p>
                  <p>⏱️ Duration: {duration} hour{duration !== 1 ? 's' : ''}</p>
                  {duration <= 1 && user?.role === 'student' && (
                    <p className="text-xs mt-2 text-success">
                      ✓ Auto-approval eligible (≤1 hour)
                    </p>
                  )}
                  {duration > 1 && user?.role === 'student' && (
                    <p className="text-xs mt-2 text-warning">
                      ⚠️ Requires HOD approval ({'>'}1 hour)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
