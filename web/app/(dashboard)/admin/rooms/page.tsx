// FILE: web/app/(dashboard)/admin/rooms/page.tsx
"use client";
import { useRooms, useCreateRoom, useUpdateRoomDescription, useAddModerator, useRemoveModerator } from "@/hooks/api/useRooms";
import { useAllVolunteers } from "@/hooks/api/useAdmin"; // CORRECTED: Import from useAdmin
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminRoomsPage() {
    const { data: rooms, isLoading: isLoadingRooms } = useRooms();
    
    // This hook returns the full response: { success, data, pagination }
    const { data: volunteersResponse, isLoading: isLoadingVolunteers } = useAllVolunteers(); 
    const volunteers = volunteersResponse?.data || [];

    console.log(volunteers)
    
    // Mutations
    const createRoomMutation = useCreateRoom();
    const updateDescMutation = useUpdateRoomDescription();
    const addModeratorMutation = useAddModerator();
    const removeModeratorMutation = useRemoveModerator();
    
    // State
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [managingRoom, setManagingRoom] = useState<any>(null);

    // Forms
    const createForm = useForm();
    const manageForm = useForm();

    const onCreateSubmit = (data: any) => {
        createRoomMutation.mutate(data, {
            onSuccess: () => {
                createForm.reset();
                setCreateDialogOpen(false);
            }
        });
    };
    
    const onUpdateDescription = (data: any) => {
        if (!managingRoom) return;
        updateDescMutation.mutate({ topic: managingRoom.topic, description: data.description });
    };

    const onAddModerator = (data: any) => {
        if (!managingRoom || !data.volunteerId) {
            toast.error("Please select a volunteer.");
            return;
        }
        addModeratorMutation.mutate({ topic: managingRoom.topic, volunteerId: data.volunteerId }, {
            onSuccess: (updatedRoom) => setManagingRoom(updatedRoom.data) // Update state with new data
        });
    };

    const onRemoveModerator = (volunteerId: string) => {
        if (!managingRoom) return;
        removeModeratorMutation.mutate({ topic: managingRoom.topic, volunteerId }, {
            onSuccess: (updatedRoom) => setManagingRoom(updatedRoom.data) // Update state with new data
        });
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Chat Rooms</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/> Create Room</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create a New Peer Room</DialogTitle></DialogHeader>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="topic">Topic</Label>
                                <Input id="topic" {...createForm.register("topic", { required: "Topic is required" })} placeholder="e.g., mindfulness" />
                                {createForm.formState.errors.topic && <p className="text-sm text-destructive mt-1">{`${createForm.formState.errors.topic.message}`}</p>}
                            </div>
                             <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...createForm.register("description", { required: "Description is required" })} placeholder="A brief description of the room's purpose."/>
                                {createForm.formState.errors.description && <p className="text-sm text-destructive mt-1">{`${createForm.formState.errors.description.message}`}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={createRoomMutation.isPending}>
                                {createRoomMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Room
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
                    {isLoadingRooms ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                    : rooms?.map((room: any) => (
                        <TableRow key={room.topic}>
                            <TableCell className="font-medium capitalize">{room.topic}</TableCell>
                            <TableCell className="max-w-xs truncate">{room.description}</TableCell>
                            <TableCell>{room.moderators.length}</TableCell>
                            <TableCell><Button variant="outline" size="sm" onClick={() => setManagingRoom(room)}>Manage</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Manage Room Dialog */}
            <Dialog open={!!managingRoom} onOpenChange={() => setManagingRoom(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Room: <span className="capitalize font-bold">{managingRoom?.topic}</span></DialogTitle>
                        <DialogDescription>Update room details and assign moderators.</DialogDescription>
                    </DialogHeader>
                    
                    {/* Update Description Form */}
                    <form onSubmit={manageForm.handleSubmit(onUpdateDescription)} className="space-y-4 pt-4 border-t">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...manageForm.register("description")} defaultValue={managingRoom?.description}/>
                        <Button type="submit" size="sm" disabled={updateDescMutation.isPending}>Update Description</Button>
                    </form>

                    {/* Manage Moderators Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Moderators</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                           {managingRoom?.moderators.length > 0 ? managingRoom.moderators.map((mod: any) => (
                               <div key={mod._id} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                   <p className="text-sm font-medium">{mod.name}</p>
                                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveModerator(mod._id)}>
                                       <Trash2 className="h-4 w-4 text-destructive"/>
                                   </Button>
                               </div>
                           )) : <p className="text-sm text-muted-foreground text-center">No moderators assigned.</p>}
                        </div>

                        <form onSubmit={manageForm.handleSubmit(onAddModerator)} className="flex gap-2 items-end">
                             <div className="flex-grow">
                                <Label>Add Volunteer</Label>
                                <Controller
                                    name="volunteerId"
                                    control={manageForm.control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingVolunteers}>
                                            <SelectTrigger><SelectValue placeholder="Select a volunteer..." /></SelectTrigger>
                                            <SelectContent>
                                                {/* This now correctly maps over the 'volunteers' array */}
                                                {volunteers.map((v: any) => (
                                                    <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                             </div>
                            <Button type="submit" disabled={addModeratorMutation.isPending}>Add</Button>
                        </form>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setManagingRoom(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}