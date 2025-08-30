// web/app/(dashboard)/volunteer/rooms/page.tsx
"use client";
import { useModeratedRooms } from "@/hooks/api/useVolunteers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";

export default function VolunteerRoomsPage() {
    const { data: rooms, isLoading } = useModeratedRooms();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Moderated Rooms</h1>
            {isLoading && <div className="flex justify-center"><Spinner /></div>}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms?.map((room: any) => (
                    <Card key={room._id}>
                        <CardHeader>
                            <CardTitle className="capitalize flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                {room.topic}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{room.description}</p>
                            <Button className="w-full" asChild>
                                <Link href={`/chat/${room.topic}`}>Enter Room</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {!isLoading && rooms?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">You are not moderating any rooms yet.</p>
             )}
        </div>
    );
}