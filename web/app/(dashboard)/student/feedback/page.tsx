// web/app/(dashboard)/student/feedback/page.tsx
"use client";
import { useForm, Controller } from "react-hook-form";
import { useAvailableCounsellors, useStudentConnections } from "@/hooks/api/useStudents";
import { useSubmitFeedback, useMyFeedback, useDeleteFeedback } from "@/hooks/api/useFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "dayjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentFeedbackPage() {
    // Hooks for fetching data and mutations
    const { data: connections, isLoading: isLoadingConnections } = useStudentConnections();
    const { data: myFeedback, isLoading: isLoadingMyFeedback } = useMyFeedback();
    const submitFeedbackMutation = useSubmitFeedback();
    const deleteFeedbackMutation = useDeleteFeedback();

    // Form handling
    const { control, handleSubmit, register, reset, formState: { errors } } = useForm();
    const [rating, setRating] = useState(0);

    // Filter connected counsellors and volunteers to give feedback to
    const counsellors = connections?.counsellors || [];
    const volunteers = connections?.volunteers || [];
    const feedbackTargets = [
        ...counsellors.map((c: any) => ({ ...c, type: 'counsellor' })),
        ...volunteers.map((v: any) => ({ ...v, type: 'volunteer' }))
    ];

    console.log(feedbackTargets)
    console.log(myFeedback)

    const onSubmit = (data: any) => {
        if (rating === 0) {
            alert("Please provide a rating.");
            return;
        }
        const [targetType, targetId] = data.target.split('-');
        
        submitFeedbackMutation.mutate(
            { ...data, targetId, targetType, rating },
            {
                onSuccess: () => {
                    reset({ target: '', comment: '' });
                    setRating(0);
                }
            }
        );
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {/* Form for submitting new feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>Submit Feedback</CardTitle>
                    <CardDescription>Share your experience with a counsellor or volunteer you've connected with.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>Select Professional</Label>
                            <Controller
                                name="target"
                                control={control}
                                rules={{ required: "You must select a professional." }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingConnections}>
                                        <SelectTrigger><SelectValue placeholder="Select a counsellor or volunteer..." /></SelectTrigger>
                                        <SelectContent>
                                            {feedbackTargets.map((target: any) => 
                                                <SelectItem key={target._id} value={`${target.type}-${target._id}`}>
                                                    {target.name} ({target.type})
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                             {errors.target && <p className="text-sm text-destructive mt-1">{`${errors.target.message}`}</p>}
                        </div>
                        <div>
                            <Label>Rating</Label>
                            <div className="flex space-x-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`cursor-pointer h-6 w-6 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea id="comment" {...register("comment")} placeholder="Share your thoughts..."/>
                        </div>
                        <Button type="submit" disabled={submitFeedbackMutation.isPending}>
                             {submitFeedbackMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Feedback
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Section to display past feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>My Past Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingMyFeedback && <div className="flex justify-center"><Spinner /></div>}
                    {!isLoadingMyFeedback && (!myFeedback || myFeedback.length === 0) && (
                        <p className="text-center text-muted-foreground py-6">You haven't submitted any feedback yet.</p>
                    )}
                    <div className="space-y-4">
                        {myFeedback?.map((fb: any) => (
                            <div key={fb._id} className="border p-4 rounded-md flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{fb.targetType}</p>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 italic">"{fb.comment}"</p>
                                    <p className="text-xs text-muted-foreground mt-2">{dayjs(fb.createdAt).format("MMM D, YYYY")}</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete your feedback.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteFeedbackMutation.mutate(fb._id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}