// web/components/forms/CreateCounsellorForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
// ... other necessary imports (Button, Input, Label, Loader2)

export function CreateCounsellorForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      {/* Name, Email, Password, Specialization fields... */}
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Counsellor
      </Button>
    </form>
  );
}