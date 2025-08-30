"use client";
// This page can be a generic notification center.
// We can create a reusable component for it later.
export default function CounsellorNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <p className="text-muted-foreground">Your latest alerts will appear here.</p>
       {/* TODO: Fetch and display notifications using a hook */}
    </div>
  );
}