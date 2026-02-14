import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CheckCircle2 } from 'lucide-react';
import InfraResourcesTab from '@/components/admin/InfraResourcesTab';
import InfraApprovalsTab from '@/components/admin/InfraApprovalsTab';

export function InfraAdminDashboard() {
    const [activeTab, setActiveTab] = useState('resources');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Infrastructure Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage campus facilities and approve booking requests</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="resources" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Resources
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approvals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="mt-6">
                    <InfraResourcesTab />
                </TabsContent>

                <TabsContent value="approvals" className="mt-6">
                    <InfraApprovalsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
