// web/app/(dashboard)/admin/resources/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { psychoeducationalResourceAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Trash2, Edit, Link as LinkIcon, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";

export default function AdminResourcesPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);

    const { data: resourcesResponse, isLoading } = useQuery({
        queryKey: ["psychoeducationalResources"],
        queryFn: psychoeducationalResourceAPI.getAllResources,
    });
    const resources = resourcesResponse?.data || [];

    const createResourceMutation = useMutation({
        mutationFn: (data: FormData) => psychoeducationalResourceAPI.createResource(data),
        onSuccess: () => {
            toast.success("Resource created successfully.");
            queryClient.invalidateQueries({ queryKey: ["psychoeducationalResources"] });
            setDialogOpen(false);
            reset(); // Clear form after successful creation
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create resource.");
        },
    });

    const updateResourceMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => psychoeducationalResourceAPI.updateResource(id, data),
        onSuccess: () => {
            toast.success("Resource updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["psychoeducationalResources"] });
            setEditingResource(null);
            setDialogOpen(false);
            reset(); // Clear form after successful update
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update resource.");
        },
    });

    const deleteResourceMutation = useMutation({
        mutationFn: (id: string) => psychoeducationalResourceAPI.deleteResource(id),
        onSuccess: () => {
            toast.success("Resource deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["psychoeducationalResources"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete resource.");
        },
    });

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm();
    const resourceType = watch("type");

    // Pre-fill form when editing an existing resource
    useEffect(() => {
        if (editingResource) {
            setValue("title", editingResource.title);
            setValue("description", editingResource.description);
            setValue("url", editingResource.url);
            setValue("type", editingResource.type);
            setValue("language", editingResource.language);
            setValue("category", Array.isArray(editingResource.category) ? editingResource.category.join(', ') : '');
        } else {
            reset(); // Clear form if not editing
        }
    }, [editingResource, setValue, reset]);

    const onSubmit = (data: any) => {
        const formData = new FormData();
        // Append all form data fields
        Object.keys(data).forEach(key => {
            if (key === "resourceFile" && data[key] && data[key][0]) {
                formData.append(key, data[key][0]); // Append file if present
            } else if (key === "category" && typeof data[key] === 'string') {
                formData.append(key, data[key].split(',').map((s: string) => s.trim()).filter(Boolean).join(','));
            }
            else if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        if (editingResource) {
            updateResourceMutation.mutate({ id: editingResource._id, data: formData });
        } else {
            createResourceMutation.mutate(formData);
        }
    };

    const handleOpenDialog = (resource?: any) => {
        setEditingResource(resource);
        setDialogOpen(true);
    };


    const languages = [
        { value: "en", label: "English" },
        { value: "hi", label: "Hindi" },
        { value: "bn", label: "Bengali" },
        { value: "ta", label: "Tamil" },
        { value: "te", label: "Telugu" },
        { value: "mr", label: "Marathi" },
        { value: "gu", label: "Gujarati" },
        { value: "pa", label: "Punjabi" },
    ];

    const resourceTypes = [
        { value: "video", label: "Video" },
        { value: "audio", label: "Audio" },
        { value: "article", label: "Article" },
        { value: "document", label: "Document" },
        { value: "meditation", label: "Meditation" },
        { value: "exercise", label: "Exercise" },
    ];
    
    const getFileUrl = (resource: any) => {
        if (resource.file && resource.file.url) {
            return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${resource.file.url}`;
        }
        return resource.url;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Psychoeducational Resources</h1>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Resource</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
                            <DialogDescription>{editingResource ? "Update the details of this resource." : "Add a new pre-vetted resource for students."}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...register("title", { required: "Title is required" })} />
                                {errors.title && <p className="text-sm text-destructive mt-1">{`${errors.title.message}`}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...register("description")} placeholder="Brief description of the resource." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        rules={{ required: "Type is required" }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                                <SelectContent>
                                                    {resourceTypes.map(rt => <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.type && <p className="text-sm text-destructive mt-1">{`${errors.type.message}`}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Controller
                                        name="language"
                                        control={control}
                                        rules={{ required: "Language is required" }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                                <SelectContent>
                                                    {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.language && <p className="text-sm text-destructive mt-1">{`${errors.language.message}`}</p>}
                                </div>
                            </div>

                            {(resourceType === "document" || resourceType === "audio" || resourceType === "video") ? (
                                <div>
                                    <Label htmlFor="resourceFile">Upload File (Optional for URL-based content)</Label>
                                    <Input id="resourceFile" type="file" {...register("resourceFile")} />
                                    {editingResource?.file && <p className="text-sm text-muted-foreground mt-1">Current file: {editingResource.file.originalName}</p>}
                                    {/* Optionally allow clearing file (implement 'clearFile' in backend) */}
                                </div>
                            ) : null}

                            {(resourceType === "article" || (resourceType && resourceType !== "document")) ? (
                                <div>
                                    <Label htmlFor="url">URL (Required for articles, optional for file uploads)</Label>
                                    <Input id="url" type="url" {...register("url", { required: resourceType === "article" ? "URL is required for articles." : false })} placeholder="e.g., https://example.com/article" />
                                    {errors.url && <p className="text-sm text-destructive mt-1">{`${errors.url.message}`}</p>}
                                </div>
                            ) : null}

                            <div>
                                <Label htmlFor="category">Categories (comma-separated, e.g., anxiety, stress)</Label>
                                <Input id="category" {...register("category")} placeholder="e.g., anxiety, stress, mindfulness" />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createResourceMutation.isPending || updateResourceMutation.isPending}>
                                    {createResourceMutation.isPending || updateResourceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {editingResource ? "Update Resource" : "Add Resource"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24"><Spinner /></TableCell></TableRow>
                            ) : resources?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No resources found.</TableCell></TableRow>
                            ) : (
                                resources?.map((resource: any) => (
                                    <TableRow key={resource._id}>
                                        <TableCell className="font-medium">{resource.title}</TableCell>
                                        <TableCell><Badge variant="secondary" className="capitalize">{resource.type}</Badge></TableCell>
                                        <TableCell>{languages.find(l => l.value === resource.language)?.label}</TableCell>
                                        <TableCell>{Array.isArray(resource.category) && resource.category.length > 0 ? resource.category.join(', ') : 'N/A'}</TableCell>
                                        <TableCell className="flex gap-2">
                                            {resource.url && (
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="icon" title="View URL"><ExternalLink className="h-4 w-4" /></Button>
                                                </a>
                                            )}
                                            {resource.file && resource.file.url && (
                                                 <a href={getFileUrl(resource)} target="_blank" rel="noopener noreferrer" download>
                                                    <Button variant="ghost" size="icon" title="Download File"><Download className="h-4 w-4" /></Button>
                                                 </a>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(resource)}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the resource.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteResourceMutation.mutate(resource._id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}