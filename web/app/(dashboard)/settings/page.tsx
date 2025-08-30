// web/app/(dashboard)/settings/page.tsx
"use client";
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account and notification settings.
      </p>
      {/* TODO: Add forms for changing password, notification preferences etc. */}
    </div>
  );
}
