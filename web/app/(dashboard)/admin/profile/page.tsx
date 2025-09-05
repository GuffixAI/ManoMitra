// MODIFIED: web/app/(dashboard)/admin/profile/page.tsx
"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/api/useAdmin"; // MODIFIED: Use the new hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Admin } from "@/types/auth"; 

export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading: isLoadingProfile } = useAdminProfile(); // MODIFIED
  const updateProfileMutation = useUpdateAdminProfile(); // MODIFIED

  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name);
      setValue("contactNumber", profile.contactNumber || "");
    }
  }, [profile, setValue]);

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoadingProfile) {
    return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Administrator Information</CardTitle>
          <CardDescription>
            Update your personal details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="text-sm text-destructive">{`${errors.name.message}`}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={profile?.email || ''} readOnly disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" {...register("contactNumber")} placeholder="e.g., +1 234 567 890" />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={!isDirty || updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}