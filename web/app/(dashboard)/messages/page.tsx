"use client";

import { useMyConversations } from "@/hooks/api/useConversations";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function MessagesListPage() {
  const { data: conversations, isLoading } = useMyConversations();
  const { user: currentUser } = useAuthStore();

  console.log(conversations);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">My Conversations</h1>
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
          {!isLoading && (!conversations || conversations.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              You have no active conversations.
            </p>
          )}
          <div className="space-y-3">
            {conversations?.map((convo: any) => {
              // Find the other participant in the conversation
              const otherParticipant = convo.participants.find(
                (p: any) => p.user && p.user._id !== currentUser?._id
              )?.user;

              if (!otherParticipant) return null;

              return (
                <Link
                  key={convo._id}
                  href={`/messages/${otherParticipant._id}/${otherParticipant?.role}`}
                  className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={otherParticipant.profileImage} />
                      <AvatarFallback>
                        {otherParticipant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{otherParticipant.name}</p>
                        {convo.lastMessage && (
                          <p className="text-xs text-muted-foreground">
                            {dayjs(convo.lastMessage.createdAt).fromNow()}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {convo.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
