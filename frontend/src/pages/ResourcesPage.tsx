import { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Resource, ResourceType, ResourceCategory, TimeSlot } from '@/types';
import { ResourceCard } from '@/components/ResourceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { DEPARTMENT_LIST } from '@/constants/departments';

export default function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useBooking();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [customDepartment, setCustomDepartment] = useState('');

  // Default time slots
  const DEFAULT_TIME_SLOTS: TimeSlot[] = [
    { label: '1 Hour', duration: 1, isDefault: true },
    { label: '2 Hours', duration: 2, isDefault: false },
    { label: 'Half Day', duration: 4, isDefault: false },
    { label: 'Full Day', duration: 8, isDefault: false },
  ];

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotDuration, setNewSlotDuration] = useState('');

  const isAdmin = user?.role === 'admin';

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(search.toLowerCase()) ||
      resource.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;

    // Students only see their department's resources
    if (user?.role === 'student' && user.department) {
      return matchesSearch && matchesType && resource.department === user.department;
    }

    // Department role users only see their department's resources
    if (user?.role === 'department' && user.department) {
      return matchesSearch && matchesType && resource.department === user.department;
    }

    return matchesSearch && matchesType;
  });

  const handleSaveResource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const type = formData.get('type') as ResourceType;

    // Auto-determine category based on type
    let category: ResourceCategory;
    if (['classroom', 'lab', 'department_library', 'department_seminar_hall'].includes(type)) {
      category = 'department';
    } else if (['central_seminar_hall', 'auditorium', 'conference_room', 'bus'].includes(type)) {
      category = 'central';
    } else {
      category = 'movable_asset';
    }

    const resourceData: Resource = {
      id: editingResource?.id || `res-${Date.now()}`,
      name: formData.get('name') as string,
      type,
      category,
      capacity: parseInt(formData.get('capacity') as string),
      location: formData.get('location') as string,
      amenities: (formData.get('amenities') as string).split(',').map((a) => a.trim()),
      department: selectedDepartment === 'other'
        ? customDepartment
        : (selectedDepartment === 'none' ? undefined : selectedDepartment),
      isAvailable: true,
      availableTimeSlots: timeSlots.filter(slot => slot.isDefault !== false),
    };

    if (editingResource) {
      updateResource(editingResource.id, resourceData);
      toast.success('Resource updated successfully');
    } else {
      addResource(resourceData);
      toast.success('Resource added successfully');
    }

    setIsDialogOpen(false);
    setEditingResource(null);
    setTimeSlots(DEFAULT_TIME_SLOTS);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    // Check if department is in the predefined list
    const isDepartmentInList = DEPARTMENT_LIST.some(dept => dept.value === resource.department);
    if (isDepartmentInList) {
      setSelectedDepartment(resource.department || '');
      setCustomDepartment('');
    } else {
      setSelectedDepartment('other');
      setCustomDepartment(resource.department || '');
    }
    // Load existing time slots or use defaults
    if (resource.availableTimeSlots && resource.availableTimeSlots.length > 0) {
      setTimeSlots(resource.availableTimeSlots);
    } else {
      setTimeSlots(DEFAULT_TIME_SLOTS);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteResource(id);
    toast.success('Resource deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground">
            {user?.role === 'department'
              ? 'Manage your department resources'
              : 'Browse and book available resources'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingResource(null);
                setSelectedDepartment('');
                setCustomDepartment('');
                setTimeSlots(DEFAULT_TIME_SLOTS);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveResource} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingResource?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingResource?.type || 'classroom'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="department_library">Department Library</SelectItem>
                      <SelectItem value="department_seminar_hall">Department Seminar Hall</SelectItem>
                      <SelectItem value="central_seminar_hall">Central Seminar Hall</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                      <SelectItem value="conference_room">Conference Room</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="projector">Projector</SelectItem>
                      <SelectItem value="camera">Camera</SelectItem>
                      <SelectItem value="sound_system">Sound System</SelectItem>
                      <SelectItem value="other_equipment">Other Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      defaultValue={editingResource?.capacity}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {DEPARTMENT_LIST.map((dept) => (
                          <SelectItem key={dept.code} value={dept.value}>
                            {dept.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedDepartment === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customDepartment">Custom Department Name</Label>
                    <Input
                      id="customDepartment"
                      placeholder="Enter department name"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingResource?.location}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Textarea
                    id="amenities"
                    name="amenities"
                    defaultValue={editingResource?.amenities.join(', ')}
                    placeholder="Projector, Whiteboard, AC"
                  />
                </div>

                {/* Time Slots Configuration */}
                <div className="space-y-3 border-t pt-4">
                  <Label>Available Time Slots</Label>
                  <p className="text-sm text-muted-foreground">
                    Select which booking durations are available for this resource
                  </p>

                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`slot-${index}`}
                            checked={slot.isDefault !== false}
                            onCheckedChange={(checked) => {
                              const updated = [...timeSlots];
                              updated[index].isDefault = checked as boolean;
                              setTimeSlots(updated);
                            }}
                          />
                          <label htmlFor={`slot-${index}`} className="text-sm cursor-pointer">
                            {slot.label} ({slot.duration}h)
                          </label>
                        </div>
                        {index >= 4 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Time Slot */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label (e.g., 3 Hours)"
                      value={newSlotLabel}
                      onChange={(e) => setNewSlotLabel(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={newSlotDuration}
                      onChange={(e) => setNewSlotDuration(e.target.value)}
                      className="w-24"
                      step="0.5"
                      min="0.5"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newSlotLabel && newSlotDuration) {
                          setTimeSlots([...timeSlots, {
                            label: newSlotLabel,
                            duration: parseFloat(newSlotDuration),
                            isDefault: true
                          }]);
                          setNewSlotLabel('');
                          setNewSlotDuration('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingResource ? 'Update Resource' : 'Add Resource'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ResourceType | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="classroom">Classrooms</SelectItem>
            <SelectItem value="lab">Laboratories</SelectItem>
            <SelectItem value="department_library">Department Libraries</SelectItem>
            <SelectItem value="department_seminar_hall">Department Seminar Halls</SelectItem>
            <SelectItem value="central_seminar_hall">Central Seminar Halls</SelectItem>
            <SelectItem value="auditorium">Auditoriums</SelectItem>
            <SelectItem value="conference_room">Conference Rooms</SelectItem>
            <SelectItem value="bus">Buses</SelectItem>
            <SelectItem value="projector">Projectors</SelectItem>
            <SelectItem value="camera">Cameras</SelectItem>
            <SelectItem value="sound_system">Sound Systems</SelectItem>
            <SelectItem value="other_equipment">Other Equipment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            showActions={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No resources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
