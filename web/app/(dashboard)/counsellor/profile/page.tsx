// web/app/(dashboard)/counsellor/profile/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { counsellorAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import React from "react";

export default function CounsellorProfilePage() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["counsellorProfile"],
        queryFn: () => counsellorAPI.getProfile(),
    });

    const { register, handleSubmit, setValue } = useForm();
    
    // Prefill form when data loads
    React.useEffect(() => {
        if (profile) {
            setValue("name", profile.name);
            setValue("email", profile.email);
            setValue("specialization", profile.specialization);
            setValue("description", profile.description);
        }
    }, [profile, setValue]);

    const onSubmit = (data: any) => {
        // TODO: Implement mutation for profile update
        console.log("Updated data:", data);
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
                            <Input id="email" type="email" {...register("email")} disabled />
                        </div>
                         <div>
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input id="specialization" {...register("specialization")} />
                        </div>
                         <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register("description")} />
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}