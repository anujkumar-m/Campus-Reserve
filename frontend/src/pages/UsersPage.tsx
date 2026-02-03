import { mockUsers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, GraduationCap, BookOpen, Building2, Sparkles } from 'lucide-react';

const roleIcons = {
  admin: Building2,
  faculty: BookOpen,
  student: GraduationCap,
  department: Users,
  club: Sparkles,
};

const roleColors = {
  admin: 'bg-destructive/10 text-destructive',
  faculty: 'bg-primary/10 text-primary',
  student: 'bg-success/10 text-success',
  department: 'bg-warning/10 text-warning',
  club: 'bg-accent/10 text-accent',
};

export default function UsersPage() {
  const usersByRole = {
    admin: mockUsers.filter((u) => u.role === 'admin'),
    faculty: mockUsers.filter((u) => u.role === 'faculty'),
    student: mockUsers.filter((u) => u.role === 'student'),
    department: mockUsers.filter((u) => u.role === 'department'),
    club: mockUsers.filter((u) => u.role === 'club'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and their access levels
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(usersByRole).map(([role, users]) => {
          const Icon = roleIcons[role as keyof typeof roleIcons];
          return (
            <Card key={role} className="stat-card">
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}s</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockUsers.map((user) => {
              const Icon = roleIcons[user.role];
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user.department && (
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {user.department}
                      </span>
                    )}
                    {user.clubName && (
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {user.clubName}
                      </span>
                    )}
                    <Badge variant="secondary" className={roleColors[user.role]}>
                      <Icon className="h-3 w-3 mr-1" />
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
