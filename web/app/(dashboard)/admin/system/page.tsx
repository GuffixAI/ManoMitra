// web/app/(dashboard)/admin/system/page.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSendSystemNotification } from "@/hooks/api/useNotifications";
import { Loader2, Send } from "lucide-react";
import { ROLES } from "@/lib/constants";

export default function AdminSystemPage() {
    // State for the UI toggles and dialogs
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isNotifyDialogOpen, setNotifyDialogOpen] = useState(false);

    // React Hook Form for the notification form
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
    const sendNotificationMutation = useSendSystemNotification();

    const handleMaintenanceToggle = (enabled: boolean) => {
        setIsMaintenanceMode(enabled);
        toast.info(`Maintenance mode is now ${enabled ? 'ON' : 'OFF'}. (Frontend state only)`);
    };

    const onSendNotificationSubmit = (data: any) => {
        sendNotificationMutation.mutate(data, {
            onSuccess: () => {
                setNotifyDialogOpen(false);
                reset(); // Clear the form
            }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Settings</h1>
            
            {/* Maintenance Mode Card (existing) */}
            <Card>
                <CardHeader>
                    <CardTitle>Maintenance Mode</CardTitle>
                    <CardDescription>
                        Put the application in maintenance mode to perform updates. Only admins will be able to log in.
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

            {/* System Notifications Card (New Implementation) */}
            <Card>
                <CardHeader>
                    <CardTitle>System Notifications</CardTitle>
                    <CardDescription>
                        Send a broadcast notification to all users of a specific role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog open={isNotifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Send className="mr-2 h-4 w-4" /> Send System Notification
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a System Announcement</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSendNotificationSubmit)} className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="role">Recipient Role</Label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        rules={{ required: "Recipient role is required" }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ROLES.STUDENT}>All Students</SelectItem>
                                                    <SelectItem value={ROLES.COUNSELLOR}>All Counsellors</SelectItem>
                                                    <SelectItem value={ROLES.VOLUNTEER}>All Volunteers</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.role && <p className="text-sm text-destructive mt-1">{`${errors.role.message}`}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="title">Notification Title</Label>
                                    <Input id="title" {...register("title", { required: "Title is required" })} placeholder="e.g., Scheduled Maintenance" />
                                    {errors.title && <p className="text-sm text-destructive mt-1">{`${errors.title.message}`}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" {...register("message", { required: "Message is required" })} placeholder="Enter the announcement details here..."/>
                                    {errors.message && <p className="text-sm text-destructive mt-1">{`${errors.message.message}`}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={sendNotificationMutation.isPending}>
                                        {sendNotificationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Notification
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}