// web/hooks/useActivityTracker.ts
"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateStudentActivity } from './api/useStudents';
import { useUpdateVolunteerActivity } from './api/useVolunteers';
import { ROLES } from '@/lib/constants';

export const useActivityTracker = () => {
  const { user, isAuthenticated } = useAuthStore();
  const studentActivityMutation = useUpdateStudentActivity();
  const volunteerActivityMutation = useUpdateVolunteerActivity();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const updateActivity = () => {
      if (user.role === ROLES.STUDENT) {
        studentActivityMutation.mutate();
      } else if (user.role === ROLES.VOLUNTEER) {
        volunteerActivityMutation.mutate();
      }
    };

    // Update immediately on load
    updateActivity();

    // Set up an interval to update every 5 minutes
    const intervalId = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, user, studentActivityMutation, volunteerActivityMutation]);
};