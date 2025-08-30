// web/app/(dashboard)/volunteer/training/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen } from "lucide-react";

export default function VolunteerTrainingPage() {
    // This would ideally be fetched from the user's profile
    const trainingCompleted = false; 

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Volunteer Training</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to Volunteer Training!</CardTitle>
                    <CardDescription>Complete the modules below to start helping students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <BookOpen className="h-6 w-6 text-primary"/>
                            <div>
                                <h3 className="font-semibold">Module 1: Active Listening</h3>
                                <p className="text-sm text-muted-foreground">Learn the fundamentals of empathetic communication.</p>
                            </div>
                        </div>
                        <Button variant="outline">Start</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <BookOpen className="h-6 w-6 text-primary"/>
                            <div>
                                <h3 className="font-semibold">Module 2: Platform Guidelines</h3>
                                <p className="text-sm text-muted-foreground">Understand the rules and best practices.</p>
                            </div>
                        </div>
                        <Button variant="outline" disabled>Locked</Button>
                    </div>

                    <div className="pt-4 border-t">
                        {trainingCompleted ? (
                             <div className="text-center text-green-600 flex items-center justify-center gap-2">
                                <CheckCircle />
                                <p>You have completed all training modules!</p>
                             </div>
                        ) : (
                             <Button className="w-full">Mark Training as Complete</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}