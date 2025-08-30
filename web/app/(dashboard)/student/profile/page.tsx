// FILE: web/app/(dashboard)/student/profile/page.tsx

"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/api/useStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";

export default function StudentProfilePage() {
  const { data: profile, isLoading: isLoadingProfile } = useStudentProfile();
  const updateProfileMutation = useUpdateStudentProfile();

  const { register, handleSubmit, control, setValue, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (profile) {
      // Pre-fill the form with existing profile data
      setValue("name", profile.name);
      setValue("contactNumber", profile.contactNumber);
      setValue("academicYear", profile.academicYear);
      setValue("department", profile.department);
      setValue("gender", profile.gender);
    }
  }, [profile, setValue]);

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoadingProfile) {
    return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Keep your details up to date. This information is confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name", { required: "Name is required" })} />
                {errors.name && <p className="text-sm text-destructive">{`${errors.name.message}`}</p>}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile?.email || ''} readOnly disabled />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" {...register("contactNumber")} placeholder="e.g., +1 234 567 890" />
              </div>

              {/* Student Code (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="studentCode">Student ID</Label>
                <Input id="studentCode" value={profile?.studentCode || ''} readOnly disabled />
              </div>

              {/* Academic Year */}
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Controller
                  name="academicYear"
                  control={control}
                  render={({ field }) => (
                     <Input id="academicYear" type="number" min="1" max="6" {...field} />
                  )}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} placeholder="e.g., Computer Science" />
              </div>

               {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                 <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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