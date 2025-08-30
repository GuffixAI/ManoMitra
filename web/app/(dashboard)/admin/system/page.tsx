// web/app/(dashboard)/admin/system/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminSystemPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Maintenance Mode</CardTitle>
                    <CardDescription>
                        Put the application in maintenance mode to perform updates. 
                        Only admins will be able to log in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" disabled />
                    <Label htmlFor="maintenance-mode">Enable Maintenance Mode (Feature coming soon)</Label>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Notifications</CardTitle>
                    <CardDescription>
                        Send a notification to all users of a specific role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>Send System Notification (Feature coming soon)</Button>
                </CardContent>
            </Card>
        </div>
    );
}