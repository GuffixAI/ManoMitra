// FILE: web/components/notifications/NotificationCenter.tsx
"use client";
import { useUserNotifications, useMarkAllAsRead } from "@/hooks/api/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { BellOff, CheckCheck } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function NotificationCenter() {
  const { data, isLoading } = useUserNotifications({ limit: 50 });
  const markAllReadMutation = useMarkAllAsRead();
  
  const notifications = data?.data?.notifications || [];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <Button
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending || !notifications.some((n:any) => !n.isRead)}
            >
                {markAllReadMutation.isPending ? "Marking..." : <><CheckCheck className="mr-2 h-4 w-4" /> Mark all as read</>}
            </Button>
        </div>
        <Card>
            <CardContent className="pt-6">
                {isLoading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}

                {!isLoading && notifications.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <BellOff className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold">All caught up!</h3>
                        <p>You have no new notifications.</p>
                    </div>
                )}

                {!isLoading && notifications.length > 0 && (
                    <div className="space-y-4">
                        {notifications.map((notif: any) => (
                            <div key={notif._id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${!notif.isRead ? 'bg-muted/50' : ''}`}>
                                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                    <p className="font-semibold">{notif.title}</p>
                                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{dayjs(notif.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}