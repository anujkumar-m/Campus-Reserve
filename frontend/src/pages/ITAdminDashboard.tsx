import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, CheckCircle2 } from 'lucide-react';
import ITResourcesTab from '@/components/admin/ITResourcesTab';
import ITApprovalsTab from '@/components/admin/ITApprovalsTab';


export function ITAdminDashboard() {
    const [activeTab, setActiveTab] = useState('resources');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">IT Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage IT resources, users, and approve asset requests</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="resources" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Resources
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approvals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="mt-6">
                    <ITResourcesTab />
                </TabsContent>

                <TabsContent value="approvals" className="mt-6">
                    <ITApprovalsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
