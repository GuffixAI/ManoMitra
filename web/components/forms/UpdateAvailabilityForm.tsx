// web/components/forms/UpdateAvailabilityForm.tsx
"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { Trash } from "lucide-react";
import { useEffect } from "react";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function UpdateAvailabilityForm({ currentAvailability, onSubmit, isLoading }) {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      availableTime: currentAvailability || []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "availableTime",
  });

  useEffect(() => {
    replace(currentAvailability || []);
  }, [currentAvailability, replace]);

  return (
    <form onSubmit={handleSubmit(data => onSubmit(data.availableTime))} className="space-y-4">
      {daysOfWeek.map(day => {
        const fieldIndex = fields.findIndex(f => f.day === day);
        const isEnabled = fieldIndex !== -1;

        return (
          <div key={day} className="flex items-center space-x-4 border p-3 rounded-md">
            <Checkbox
              id={day}
              checked={isEnabled}
              onCheckedChange={checked => {
                if (checked) {
                  append({ day, slots: [{ start: "09:00", end: "17:00" }] });
                } else {
                  remove(fieldIndex);
                }
              }}
            />
            <label htmlFor={day} className="capitalize font-medium w-24">{day}</label>
            {isEnabled && (
              <div className="flex items-center gap-2">
                <Input type="time" {...register(`availableTime.${fieldIndex}.slots.0.start`)} />
                <span>-</span>
                <Input type="time" {...register(`availableTime.${fieldIndex}.slots.0.end`)} />
              </div>
            )}
          </div>
        );
      })}
      <Button type="submit" disabled={isLoading}>Save Availability</Button>
    </form>
  );
}