// web/app/(dashboard)/student/feedback/page.tsx
"use client";
import { useForm, Controller } from "react-hook-form";
import { useAvailableCounsellors } from "@/hooks/api/useStudents";
import { useSubmitFeedback } from "@/hooks/api/useFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useState } from "react";

export default function StudentFeedbackPage() {
    const { data: counsellorsResponse, isLoading: isLoadingCounsellors } = useAvailableCounsellors();
    const counsellors = counsellorsResponse?.data || [];
    const submitFeedbackMutation = useSubmitFeedback();
    const { control, handleSubmit, register, reset } = useForm();
    const [rating, setRating] = useState(0);

    const onSubmit = (data: any) => {
        submitFeedbackMutation.mutate(
            { ...data, rating, targetType: 'counsellor' },
            {
                onSuccess: () => {
                    reset();
                    setRating(0);
                }
            }
        );
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold">Submit Feedback</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Share Your Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>Select Counsellor</Label>
                            <Controller
                                name="targetId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCounsellors}>
                                        <SelectTrigger><SelectValue placeholder="Select a counsellor" /></SelectTrigger>
                                        <SelectContent>
                                            {counsellors.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div>
                            <Label>Rating</Label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`cursor-pointer h-6 w-6 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Comment</Label>
                            <Textarea {...register("comment")} placeholder="Share your thoughts..."/>
                        </div>
                        <Button type="submit" disabled={submitFeedbackMutation.isPending}>
                            Submit Feedback
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}