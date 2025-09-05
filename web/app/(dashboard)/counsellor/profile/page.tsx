// MODIFIED: web/app/(dashboard)/counsellor/profile/page.tsx
"use client";
import { useCounsellorProfile, useUpdateCounsellorProfile } from "@/hooks/api/useCounsellors"; // MODIFIED
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import React from "react";
import { Loader2 } from "lucide-react";

export default function CounsellorProfilePage() {
    const { data: profile, isLoading } = useCounsellorProfile(); // MODIFIED
    const updateProfileMutation = useUpdateCounsellorProfile(); // MODIFIED

    const { register, handleSubmit, setValue, formState: { isDirty } } = useForm();
    
    React.useEffect(() => {
        if (profile) {
            setValue("name", profile.name);
            setValue("specialization", profile.specialization.join(', ')); // MODIFIED: Handle array
            setValue("description", profile.description);
        }
    }, [profile, setValue]);

    const onSubmit = (data: any) => {
        // MODIFIED: Convert comma-separated string back to array for the API
        const updatedData = {
            ...data,
            specialization: data.specialization.split(',').map((s: string) => s.trim()).filter(Boolean)
        };
        updateProfileMutation.mutate(updatedData);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and professional details here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register("name")} />
                        </div>
                         <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={profile?.email} disabled />
                        </div>
                         <div>
                            <Label htmlFor="specialization">Specialization (comma-separated)</Label>
                            <Input id="specialization" {...register("specialization")} />
                        </div>
                         <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register("description")} />
                        </div>
                        <Button type="submit" disabled={!isDirty || updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}