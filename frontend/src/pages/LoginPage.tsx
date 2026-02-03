import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, Building2, BookOpen, Sparkles } from 'lucide-react';

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Building2 className="h-5 w-5" />,
  faculty: <BookOpen className="h-5 w-5" />,
  student: <GraduationCap className="h-5 w-5" />,
  department: <Users className="h-5 w-5" />,
  club: <Sparkles className="h-5 w-5" />,
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  faculty: 'Faculty Member',
  student: 'Student',
  department: 'Department Head',
  club: 'Club Representative',
};

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full system access, manage resources and view all bookings',
  faculty: 'Book resources and manage your class schedules',
  student: 'Request resource bookings and track status',
  department: 'Manage department resources and approve bookings',
  club: 'Book venues for club events and activities',
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="w-full max-w-md page-transition">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campus Reserve</h1>
          <p className="text-muted-foreground">College Resource Booking System</p>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Select your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose your role..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <SelectItem key={role} value={role} className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-primary">{roleIcons[role]}</span>
                      <span>{roleLabels[role]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRole && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-primary">{roleIcons[selectedRole]}</span>
                  <span className="font-medium text-foreground">{roleLabels[selectedRole]}</span>
                </div>
                <p className="text-sm text-muted-foreground">{roleDescriptions[selectedRole]}</p>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={!selectedRole}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              Sign In
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a demo system with simulated authentication
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
