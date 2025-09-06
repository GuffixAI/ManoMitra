import { useQuery } from "@tanstack/react-query";
import { conversationAPI } from "@/lib/api";

export const useMyConversations = () => {
  return useQuery({
    queryKey: ["myConversations"],
    queryFn: () => conversationAPI.getMyConversations(),
  });
};

export const useConversationMessages = (userId: string) => {
  return useQuery({
    queryKey: ["conversationMessages", userId],
    queryFn: () => conversationAPI.getMessagesWithUser(userId),
    enabled: !!userId,
  });
};