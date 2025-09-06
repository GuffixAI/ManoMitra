// FILE: web/app/(dashboard)/student/chat/page.tsx
"use client";

import { useRooms } from "@/hooks/api/useRooms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function StudentChatLobbyPage() {
  const { data: rooms, isLoading } = useRooms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Peer Support Rooms</h1>
        <p className="text-muted-foreground">
          Join a conversation, share your thoughts, and connect with peers in a safe space.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && rooms && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room: any) => (
            <Card key={room.topic} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="capitalize">{room.topic}</CardTitle>
                        <CardDescription>
                            {room.moderators.length > 0 
                                ? `${room.moderators.length} moderator(s) active` 
                                : "Peer-led discussion"}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground h-20">
                  {room.description || `A general discussion room about ${room.topic}.`}
                </p>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={`/chat/${room.topic}`} passHref>
                  <Button className="w-full">
                    Join Room <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}