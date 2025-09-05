// web/app/(dashboard)/admin/system/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminSystemPage() {
    // State to manage the UI toggle
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    const handleMaintenanceToggle = (enabled: boolean) => {
        setIsMaintenanceMode(enabled);
        toast.info(`Maintenance mode is now ${enabled ? 'ON' : 'OFF'}. (Frontend state only)`);
    };

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
                    <Switch
                        id="maintenance-mode"
                        checked={isMaintenanceMode}
                        onCheckedChange={handleMaintenanceToggle}
                    />
                    <Label htmlFor="maintenance-mode">
                        {isMaintenanceMode ? "Maintenance Mode is ON" : "Maintenance Mode is OFF"}
                    </Label>
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
                    {/* This would open a dialog with a form to send notifications */}
                    <Button onClick={() => toast.info("This feature is not yet implemented.")}>
                        Send System Notification
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}