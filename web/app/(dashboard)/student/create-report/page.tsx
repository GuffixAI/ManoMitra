// FILE: web/app/(dashboard)/student/create-report/page.tsx

"use client";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReport } from "@/hooks/api/useReports";
import { Loader2 } from "lucide-react";

type ReportFormValues = {
  title: string;
  content: string;
  category: 'academic' | 'personal' | 'health' | 'financial'|'bullying' | 'social'|'relationship' |'mental'| 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

export default function StudentCreateReportPage() {
  const router = useRouter();
  const createReportMutation = useCreateReport();
  const { register, handleSubmit, control, formState: { errors } } = useForm<ReportFormValues>({
    defaultValues: {
      priority: 'medium',
      category: 'personal',
    }
  });

  const onSubmit = (data: ReportFormValues) => {
    createReportMutation.mutate(data, {
      onSuccess: () => {
        router.push('/student/reports');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Create a New Report</h1>
      <p className="text-muted-foreground">
        Share what's on your mind. This is a secure and confidential space.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>New Report Details</CardTitle>
          <CardDescription>
            Provide as much detail as you feel comfortable with. This will help us support you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Feeling overwhelmed with exams"
                {...register("title", { required: "Title is required" })}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                 <Controller
                  name="priority"
                  control={control}
                  rules={{ required: "Priority is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Describe the situation, your feelings, and any specific challenges you're facing."
                rows={10}
                {...register("content", { required: "Content cannot be empty", minLength: { value: 20, message: "Please provide at least 20 characters."} })}
                className={errors.content ? "border-destructive" : ""}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createReportMutation.isPending} className="cursor-pointer">
                {createReportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}