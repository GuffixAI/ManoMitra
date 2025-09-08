// FILE: web/hooks/api/useAIReports.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiReportAPI } from "@/lib/api"; // This will be defined in the next step
import { toast } from "sonner";

/**
 * @hook useCreateAIReport
 * @desc A mutation hook for generating a new AI report from a conversation history.
 * On success, it invalidates the list of reports to trigger a refetch.
 */
export const useCreateAIReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversation_history: string) => aiReportAPI.createReport(conversation_history),
    onSuccess: () => {
      // When a new report is created, invalidate the query that fetches the list
      // of all AI reports, causing the list to automatically update.
      queryClient.invalidateQueries({ queryKey: ["myAIReports"] });
      toast.success("AI report has been successfully generated!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate AI report.");
    },
  });
};

/**
 * @hook useGetMyAIReports
 * @desc A query hook for fetching a list of all AI reports for the logged-in student.
 */
export const useGetMyAIReports = () => {
  return useQuery({
    queryKey: ["myAIReports"],
    queryFn: () => aiReportAPI.getMyReports(),
  });
};

/**
 * @hook useGetAIReportById
 * @desc A query hook for fetching the full details of a single AI report by its ID.
 * @param {string} id - The ID of the report to fetch.
 */
export const useGetAIReportById = (id: string) => {
  return useQuery({
    // The query key includes the ID so that each report is cached individually.
    queryKey: ["aiReport", id],
    queryFn: () => aiReportAPI.getReportById(id),
    // This ensures the query only runs when an 'id' is actually provided.
    enabled: !!id,
  });
};