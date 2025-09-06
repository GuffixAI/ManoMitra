// web/app/(dashboard)/student/profile/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useStudentProfile, useUpdateStudentProfile } from "@/hooks/api/useStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

export default function StudentProfilePage() {
  const { data: profile, isLoading: isLoadingProfile } = useStudentProfile();
  const updateProfileMutation = useUpdateStudentProfile();

  const { register, handleSubmit, control, setValue, formState: { errors, isDirty } } = useForm();
  
  // State for the date picker
  const [dob, setDob] = useState<Date | undefined>();

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("contactNumber", profile.contactNumber || "");
      setValue("academicYear", profile.academicYear || 1);
      setValue("department", profile.department || "");
      setValue("gender", profile.gender || "prefer_not_to_say");
      // New fields
      setValue("emergencyContact", profile.emergencyContact || "");
      if (profile.dateOfBirth) {
        setDob(new Date(profile.dateOfBirth));
      }
    }
  }, [profile, setValue]);

  const onSubmit = (data: any) => {
    const payload = {
        ...data,
        dateOfBirth: dob ? dob.toISOString() : undefined,
    };
    updateProfileMutation.mutate(payload);
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
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name", { required: "Name is required" })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile?.email || ''} readOnly disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" {...register("contactNumber")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" {...register("emergencyContact")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dob ? dayjs(dob).format('MMM D, YYYY') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        {/* FIX: Updated Calendar props */}
                        <Calendar
                            mode="single"
                            selected={dob}
                            onSelect={setDob}
                            captionLayout="dropdown"
                            fromDate={new Date(1980, 0)}
                            toDate={new Date()}
                        />
                    </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                 <Controller name="gender" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input id="academicYear" type="number" min="1" max="6" {...register("academicYear")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={(!isDirty && !dob) || updateProfileMutation.isPending}>
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