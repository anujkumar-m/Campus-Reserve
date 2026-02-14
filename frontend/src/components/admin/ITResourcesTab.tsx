import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import * as itAdminService from '../../services/itAdminService';
import { ResourceType, ResourceCategory } from '../../types';

export default function ITResourcesTab() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'projector',
        category: 'central',
        capacity: '1',
        location: '',
        department: '',
        amenities: '',
        requiresApproval: true,
        maxBookingDuration: '4',
    });

    // Fetch resources
    const { data: resourcesData, isLoading } = useQuery({
        queryKey: ['it-resources'],
        queryFn: () => itAdminService.getResources({}),
    });

    // Fetch stats
    const { data: statsData } = useQuery({
        queryKey: ['it-stats'],
        queryFn: itAdminService.getStats,
    });

    // Create resource mutation
    const createMutation = useMutation({
        mutationFn: itAdminService.createResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['it-resources'] });
            queryClient.invalidateQueries({ queryKey: ['it-stats'] });
            toast({ title: 'Success', description: 'Resource created successfully' });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create resource', variant: 'destructive' });
        },
    });

    // Update resource mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => itAdminService.updateResource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['it-resources'] });
            toast({ title: 'Success', description: 'Resource updated successfully' });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update resource', variant: 'destructive' });
        },
    });

    // Delete resource mutation
    const deleteMutation = useMutation({
        mutationFn: itAdminService.deleteResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['it-resources'] });
            queryClient.invalidateQueries({ queryKey: ['it-stats'] });
            toast({ title: 'Success', description: 'Resource deleted successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete resource', variant: 'destructive' });
        },
    });

    const resources = resourcesData?.data || [];
    const stats = statsData?.data || { totalResources: 0 };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'projector',
            category: 'central',
            capacity: '1',
            location: '',
            department: '',
            amenities: '',
            requiresApproval: true,
            maxBookingDuration: '4',
        });
        setSelectedResource(null);
    };

    const handleAddResource = () => {
        const resourceData = {
            ...formData,
            type: formData.type as ResourceType,
            category: formData.category as ResourceCategory,
            capacity: parseInt(formData.capacity) || 1,
            maxBookingDuration: parseInt(formData.maxBookingDuration) || 4,
            amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
            managedBy: 'it_services' as any,
            isMovable: true,
        };
        createMutation.mutate(resourceData);
    };

    const handleEditResource = (resource: any) => {
        setSelectedResource(resource);
        setFormData({
            name: resource.name,
            type: resource.type,
            category: resource.category,
            capacity: resource.capacity?.toString() || '1',
            location: resource.location,
            department: resource.department || '',
            amenities: resource.amenities?.join(', ') || '',
            requiresApproval: resource.requiresApproval,
            maxBookingDuration: resource.maxBookingDuration?.toString() || '4',
        });
        setIsDialogOpen(true);
    };

    const handleUpdateResource = () => {
        if (!selectedResource) return;
        const resourceData = {
            ...formData,
            capacity: parseInt(formData.capacity),
            maxBookingDuration: parseInt(formData.maxBookingDuration),
            amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        };
        updateMutation.mutate({ id: selectedResource._id || selectedResource.id, data: resourceData });
    };

    const handleDeleteResource = (resourceId: string) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            deleteMutation.mutate(resourceId);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total IT Resources</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalResources}</p>
                            </div>
                            <Package className="h-8 w-8 text-primary opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Resources Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>IT Resources</CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Resource
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{selectedResource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Resource Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Projector #1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="type">Type</Label>
                                            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="projector">Projector</SelectItem>
                                                    <SelectItem value="laptop">Laptop</SelectItem>
                                                    <SelectItem value="camera">Camera</SelectItem>
                                                    <SelectItem value="microphone">Microphone</SelectItem>
                                                    <SelectItem value="speaker">Speaker</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="department">Department</SelectItem>
                                                    <SelectItem value="central">Central</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., IT Store Room"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="department">Department (Optional)</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="amenities">Features (comma-separated)</Label>
                                        <Input
                                            id="amenities"
                                            value={formData.amenities}
                                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                            placeholder="e.g., HD, Wireless, Portable"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="requiresApproval"
                                            checked={formData.requiresApproval}
                                            onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="requiresApproval">Requires Approval</Label>
                                    </div>
                                    <Button onClick={selectedResource ? handleUpdateResource : handleAddResource} disabled={createMutation.isPending || updateMutation.isPending}>
                                        {selectedResource ? 'Update Resource' : 'Create Resource'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading resources...</p>
                    ) : resources.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No resources found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.map((resource: any) => (
                                <div key={resource._id || resource.id} className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg leading-none tracking-tight">{resource.name}</h3>
                                        <p className="text-sm text-muted-foreground capitalize mt-1.5">{resource.type.replace('_', ' ')}</p>
                                        <p className="text-sm text-muted-foreground mt-4">{resource.location}</p>
                                        {resource.amenities && resource.amenities.length > 0 && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {resource.amenities.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-auto pt-2">
                                        <Button size="default" variant="outline" className="flex-1" onClick={() => handleEditResource(resource)}>
                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                        </Button>
                                        <Button size="default" variant="destructive" className="flex-1" onClick={() => handleDeleteResource(resource._id || resource.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
