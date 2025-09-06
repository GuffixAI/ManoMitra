// web/app/(dashboard)/admin/feedback/page.tsx
"use client";
import { useFeedbackStats } from "@/hooks/api/useFeedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Star } from "lucide-react";

export default function AdminFeedbackPage() {
    const { data: stats, isLoading } = useFeedbackStats();

    const StatTable = ({ title, data }: { title: string, data: any[] }) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Total Reviews</TableHead>
                            <TableHead className="text-right">Average Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((item: any) => (
                            <TableRow key={item._id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">{item.feedbackCount}</TableCell>
                                <TableCell className="text-right flex justify-end items-center gap-1">
                                    {item.averageRating.toFixed(1)}
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return <div className="flex h-full justify-center items-center"><Spinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Feedback Analytics</h1>
                <p className="text-muted-foreground">Performance overview based on student feedback.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <StatTable title="Top Rated Counsellors" data={stats?.counsellors} />
                <StatTable title="Top Rated Volunteers" data={stats?.volunteers} />
            </div>
        </div>
    );
}