// web/app/(dashboard)/volunteer/profile/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { volunteerAPI } from "@/lib/api";
import { useUpdateVolunteerProfile } from "@/hooks/api/useVolunteers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import React from "react";

export default function VolunteerProfilePage() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["volunteerProfile"],
        queryFn: () => volunteerAPI.getProfile(),
    });
    const updateProfileMutation = useUpdateVolunteerProfile();

    const { register, handleSubmit, setValue } = useForm();
    
    React.useEffect(() => {
        if (profile) {
            Object.keys(profile).forEach(key => {
                setValue(key, profile[key]);
            });
        }
    }, [profile, setValue]);

    const onSubmit = (data: any) => {
        updateProfileMutation.mutate(data);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Volunteer Information</CardTitle>
                    <CardDescription>Update your skills, interests, and availability.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register("name")} />
                        </div>
                        <div>
                            <Label htmlFor="description">Description / Bio</Label>
                            <Textarea id="description" {...register("description")} />
                        </div>
                        <div>
                            <Label htmlFor="skills">Skills (comma-separated)</Label>
                            <Input id="skills" {...register("skills", { setValueAs: v => v.split(',').map((s: string) => s.trim()) })} />
                        </div>
                        <div>
                            <Label htmlFor="interests">Interests (comma-separated)</Label>
                            <Input id="interests" {...register("interests", { setValueAs: v => v.split(',').map((s: string) => s.trim()) })} />
                        </div>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}