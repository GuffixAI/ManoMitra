// app/(dashboard)/admin/rooms/page.tsx
"use client";
import { useRooms, useCreateRoom } from "@/hooks/api/useRooms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { PEER_TOPICS } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AdminRoomsPage() {
    const { data: rooms, isLoading } = useRooms();
    const createRoomMutation = useCreateRoom();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const onSubmit = (data: any) => {
        createRoomMutation.mutate(data, {
            onSuccess: () => setDialogOpen(false)
        });
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Chat Rooms</h1>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> Create Room</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create a New Peer Room</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div>
                                <Label>Topic</Label>
                                <Select onValueChange={(value) => setValue('topic', value, { shouldValidate: true })}>
                                    <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                                    <SelectContent>
                                        {PEER_TOPICS.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {/* Hidden input for react-hook-form registration */}
                                <input type="hidden" {...register('topic', { required: "Topic is required" })} />
                                {errors.topic && <p className="text-sm text-destructive mt-1">{`${errors.topic.message}`}</p>}
                            </div>
                             <div>
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" {...register("description")} />
                            </div>
                            <Button type="submit" disabled={createRoomMutation.isPending}>
                                {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Moderators</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                    : rooms?.map((room: any) => (
                        <TableRow key={room._id}>
                            <TableCell className="font-medium capitalize">{room.topic}</TableCell>
                            <TableCell>{room.description}</TableCell>
                            <TableCell>{room.moderators.length}</TableCell>
                            <TableCell><Button variant="outline" size="sm">Manage</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}