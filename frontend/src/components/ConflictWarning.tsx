import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Booking } from '../types';

interface ConflictWarningProps {
    booking: Booking;
    conflicts?: Booking[];
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({ booking, conflicts }) => {
    if (!booking.conflictWarning) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Booking Conflict Detected</AlertTitle>
            <AlertDescription>
                <p className="mb-2">
                    This booking overlaps with one or more existing bookings for the same resource.
                </p>
                {conflicts && conflicts.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <p className="font-semibold text-sm">Conflicting bookings:</p>
                        <ul className="list-disc list-inside text-sm">
                            {conflicts.map((conflict) => (
                                <li key={conflict.id}>
                                    {conflict.date} • {conflict.timeSlot.start} - {conflict.timeSlot.end} • {conflict.userName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <p className="mt-2 text-sm">
                    Please review and reschedule if necessary.
                </p>
            </AlertDescription>
        </Alert>
    );
};
