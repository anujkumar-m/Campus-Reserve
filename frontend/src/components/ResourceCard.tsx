import { Resource } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Monitor, FlaskConical, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
  showActions?: boolean;
  onEdit?: (resource: Resource) => void;
  onDelete?: (id: string) => void;
}

const typeIcons = {
  classroom: Monitor,
  lab: FlaskConical,
  seminar_hall: Presentation,
};

const typeLabels = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  seminar_hall: 'Seminar Hall',
};

const typeStyles = {
  classroom: 'resource-classroom',
  lab: 'resource-lab',
  seminar_hall: 'resource-seminar',
};

export function ResourceCard({ resource, compact = false, showActions, onEdit, onDelete }: ResourceCardProps) {
  const navigate = useNavigate();
  const Icon = typeIcons[resource.type];

  if (compact) {
    return (
      <div 
        className="p-3 rounded-lg border border-border bg-card hover:shadow-md transition-all cursor-pointer"
        onClick={() => navigate(`/book?resource=${resource.id}`)}
      >
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', typeStyles[resource.type])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{resource.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{resource.capacity}</span>
              <span>•</span>
              <span className="truncate">{resource.location}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="card-interactive overflow-hidden">
      <div className={cn('h-2', typeStyles[resource.type])} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', typeStyles[resource.type])}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{resource.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {typeLabels[resource.type]}
              </Badge>
            </div>
          </div>
          <Badge 
            variant={resource.isAvailable ? 'default' : 'secondary'}
            className={resource.isAvailable ? 'bg-success text-success-foreground' : ''}
          >
            {resource.isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{resource.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Capacity: {resource.capacity} people</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.amenities.slice(0, 4).map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs font-normal">
              {amenity}
            </Badge>
          ))}
          {resource.amenities.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{resource.amenities.length - 4} more
            </Badge>
          )}
        </div>

        {showActions ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit?.(resource)}
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete?.(resource.id)}
            >
              Delete
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            disabled={!resource.isAvailable}
            onClick={() => navigate(`/book?resource=${resource.id}`)}
          >
            {resource.isAvailable ? 'Book Now' : 'Unavailable'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
