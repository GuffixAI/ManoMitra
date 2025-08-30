// web/app/(dashboard)/volunteer/feedback/page.tsx
"use client";
import { useMyVolunteerFeedback } from "@/hooks/api/useVolunteers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Star } from "lucide-react";

export default function VolunteerFeedbackPage() {
    const { data: feedback, isLoading } = useMyVolunteerFeedback();

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Feedback Received</h1>
            {isLoading && <div className="flex justify-center"><Spinner /></div>}
            <div className="space-y-4">
                {feedback?.map((fb: any) => (
                    <Card key={fb._id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <p className="text-muted-foreground italic">"{fb.comment}"</p>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold">{fb.rating}</span>
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400"/>
                                </div>
                            </div>
                             <p className="text-xs text-right mt-2 text-muted-foreground">
                                From: {fb.student.name}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {!isLoading && feedback?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No feedback has been received yet.</p>
             )}
        </div>
    );
}