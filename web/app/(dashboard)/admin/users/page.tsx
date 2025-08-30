// web/app/(dashboard)/admin/users/page.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStudentsPage from "../students/page";
import AdminCounsellorsPage from "../counsellors/page";
import AdminVolunteersPage from "../volunteers/page";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Tabs defaultValue="students">
                <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="counsellors">Counsellors</TabsTrigger>
                    <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                </TabsList>
                <TabsContent value="students" className="mt-4">
                    <AdminStudentsPage />
                </TabsContent>
                <TabsContent value="counsellors" className="mt-4">
                    <AdminCounsellorsPage />
                </TabsContent>
                <TabsContent value="volunteers" className="mt-4">
                    <AdminVolunteersPage />
                </TabsContent>
            </Tabs>
        </div>
    );
}