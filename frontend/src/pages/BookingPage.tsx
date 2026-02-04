import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, TimeSlot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Building2, Users, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeSlots } from '@/data/mockData';
import { toast } from 'sonner';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resources, addBooking, getResourceById } = useBooking();
  const { user } = useAuth();

  const preselectedResourceId = searchParams.get('resource');

  const [selectedResourceId, setSelectedResourceId] = useState(preselectedResourceId || '');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [purpose, setPurpose] = useState('');

  const selectedResource = selectedResourceId ? getResourceById(selectedResourceId) : null;
  const availableResources = resources.filter((r) => r.isAvailable);

  useEffect(() => {
    if (preselectedResourceId) {
      setSelectedResourceId(preselectedResourceId);
    }
  }, [preselectedResourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResource || !date || !selectedSlot || !purpose || !user) {
      toast.error('Please fill in all fields');
      return;
    }

    const booking: Booking = {
      id: `book-${Date.now()}`,
      resourceId: selectedResource.id,
      resourceName: selectedResource.name,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      date: format(date, 'yyyy-MM-dd'),
      timeSlot: selectedSlot,
      purpose,
      status: user.role === 'faculty' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      department: selectedResource.department,
    };

    addBooking(booking);
    toast.success(
      user.role === 'faculty'
        ? 'Booking confirmed!'
        : 'Booking request submitted for approval'
    );
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

              {/* Time Slot Selection */}
              <div className="space-y-2">
                <Label>Select Time Slot</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={`${slot.start}-${slot.end}`}
                      type="button"
                      variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot.start} - {slot.end}
                    </Button>
                  ))}
                </div>
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
          {date && selectedSlot && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <h4 className="font-medium text-foreground mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📅 {format(date, 'EEEE, MMMM d, yyyy')}</p>
                  <p>🕐 {selectedSlot.start} - {selectedSlot.end}</p>
                  {user?.role !== 'faculty' && (
                    <p className="text-xs mt-2 text-warning">
                      ⚠️ Your request will require approval
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
