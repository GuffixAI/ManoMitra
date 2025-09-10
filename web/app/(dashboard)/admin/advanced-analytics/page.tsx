// web/app/(dashboard)/admin/advanced-analytics/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useTriggerAdvancedAnalytics, useLatestAdvancedAnalytics, useAllAnalyticsVersions, useAdvancedAnalyticsById } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, Graph, TrendingUp, Users, Heart, ShieldAlert, BookOpen, Clock, CalendarDays, FileText } from "lucide-react";
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { AnalyticsSnapshot } from "@/types/analytics";
import { Badge } from "@/components/ui/badge";


// Helper function to prepare data for charts
const prepareChartData = (data: { [key: string]: number }) => 
  Object.entries(data).map(([name, value]) => ({ name, value }));

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c'];

export default function AdminAdvancedAnalyticsPage() {
    const triggerAnalyticsMutation = useTriggerAdvancedAnalytics();
    const { data: latestAnalytics, isLoading: isLoadingLatest, refetch: refetchLatest } = useLatestAdvancedAnalytics();
    const { data: versionsData, isLoading: isLoadingVersions } = useAllAnalyticsVersions();

    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | undefined>(undefined);
    // Fetch the detailed snapshot if a specific version is selected, otherwise use latest
    const { data: displayedAnalytics, isLoading: isLoadingDisplayed } = useAdvancedAnalyticsById(selectedSnapshotId || "");
    
    // Use memo to pick the snapshot to display (latest by default, or specific by ID)
    const currentAnalytics: AnalyticsSnapshot | undefined = useMemo(() => {
        if (selectedSnapshotId && displayedAnalytics) {
            return displayedAnalytics;
        }
        return latestAnalytics;
    }, [selectedSnapshotId, latestAnalytics, displayedAnalytics]);

    const handleTriggerAnalytics = () => {
        triggerAnalyticsMutation.mutate({}, {
            onSuccess: (response) => {
                toast.success(`Analytics snapshot ${response.snapshot_version} generated!`);
                refetchLatest(); // Refresh latest after new one is generated
                setSelectedSnapshotId(response.snapshot_id); // Automatically select new snapshot
            },
            onError: (err) => {
                toast.error(err.message || "Failed to generate analytics.");
            },
        });
    };

    const handleVersionChange = (versionId: string) => {
        setSelectedSnapshotId(versionId);
    };

    if (isLoadingLatest || isLoadingVersions || isLoadingDisplayed) {
        return <div className="flex h-full justify-center items-center"><Spinner size="lg" /></div>;
    }

    if (!currentAnalytics && !isLoadingLatest) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
                <Graph className="w-24 h-24 text-muted-foreground" />
                <h1 className="text-3xl font-bold text-center">No Advanced Analytics Data Yet</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Generate the first snapshot of your student mental health analytics to see comprehensive trends and insights.
                </p>
                <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                    {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Generate Initial Analytics
                </Button>
                {triggerAnalyticsMutation.isPending && <p className="text-sm text-muted-foreground">This may take a moment...</p>}
            </div>
        );
    }

    const {
        snapshotVersion, snapshotTimestamp, periodStart, periodEnd,
        totalReports, totalAIReports, totalManualReports, totalStudentsEngaged,
        sentimentDistribution, riskLevelDistribution, topRedFlags,
        avgPHQ9, avgGAD7, avgGHQ, phq9Distribution, gad7Distribution, ghqDistribution,
        topStressors, topStudentConcerns, topSuggestedResourceTopics,
        avgReportResolutionTimeDays, reportsByStatus, topCounsellorsByReportsResolved, avgTimeToAssignReportHours,
        activeStudentsDaily, activeStudentsWeekly, activeStudentsMonthly,
        emergingThemes, sentimentOverTime
    } = currentAnalytics || {}; // Destructure, handling undefined if currentAnalytics is null/undefined

    const sentimentChartData = prepareChartData(sentimentDistribution || {});
    const riskLevelChartData = prepareChartData(riskLevelDistribution || {});
    const reportsByStatusChartData = prepareChartData(reportsByStatus || {});
    const phq9ChartData = prepareChartData(phq9Distribution || {});
    const gad7ChartData = prepareChartData(gad7Distribution || {});

    // Ensure TopItem arrays are in correct format for charts
    const topRedFlagsChartData = topRedFlags?.map(item => ({ name: item.flag, value: item.count })) || [];
    const topStressorsChartData = topStressors?.map(item => ({ name: item.stressor, value: item.count })) || [];
    const topStudentConcernsChartData = topStudentConcerns?.map(item => ({ name: item.concern, value: item.count })) || [];
    const topSuggestedResourceTopicsChartData = topSuggestedResourceTopics?.map(item => ({ name: item.topic, value: item.count })) || [];
    const topCounsellorsChartData = topCounsellorsByReportsResolved?.map(item => ({ name: item.name, value: item.resolvedCount })) || [];
    
    // Prepare engagement data
    const dailyActiveStudentsChartData = Object.entries(activeStudentsDaily || {})
        .map(([date, count]) => ({ date: dayjs(date).format('MMM D'), count }))
        .sort((a,b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
                <div className="flex items-center gap-4">
                    <Select value={selectedSnapshotId} onValueChange={handleVersionChange} disabled={isLoadingVersions || !versionsData?.length}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Snapshot Version" />
                        </SelectTrigger>
                        <SelectContent>
                            {versionsData?.map((version: any) => (
                                <SelectItem key={version._id} value={version._id}>
                                    {version.snapshotVersion} ({dayjs(version.snapshotTimestamp).format('MMM D, YYYY')})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleTriggerAnalytics} disabled={triggerAnalyticsMutation.isPending}>
                        {triggerAnalyticsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Generate New Snapshot
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Snapshot Overview</CardTitle>
                    <CardDescription>
                        Version: {snapshotVersion} | Generated: {dayjs(snapshotTimestamp).format('MMM D, YYYY h:mm A')}
                        {periodStart && periodEnd && ` | Data Period: ${dayjs(periodStart).format('MMM D, YYYY')} - ${dayjs(periodEnd).format('MMM D, YYYY')}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                        <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalReports + totalAIReports}</p>
                        <p className="text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="text-center">
                        <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalStudentsEngaged}</p>
                        <p className="text-muted-foreground">Students Engaged</p>
                    </div>
                    <div className="text-center">
                        <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalAIReports}</p>
                        <p className="text-muted-foreground">AI Reports</p>
                    </div>
                    <div className="text-center">
                        <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalManualReports}</p>
                        <p className="text-muted-foreground">Manual Reports</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={sentimentChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {sentimentChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Risk Level Distribution */}
                <Card>
                    <CardHeader><CardTitle>Risk Level Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={riskLevelChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Red Flags */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-500"/> Top Red Flags</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topRedFlagsChartData.length > 0 ? topRedFlagsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="destructive">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No red flags identified in this period.</p>}
                        </ul>
                    </CardContent>
                </Card>

                {/* Top Stressors */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-yellow-500"/> Top Stressors</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {topStressorsChartData.length > 0 ? topStressorsChartData.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <Badge variant="default">{item.value}</Badge>
                                </li>
                            )) : <p className="text-muted-foreground text-sm">No significant stressors identified.</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* PHQ-9 Distribution */}
                <Card>
                    <CardHeader><CardTitle>PHQ-9 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={phq9ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* GAD-7 Distribution */}
                <Card>
                    <CardHeader><CardTitle>GAD-7 Score Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={gad7ChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#ff7300" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Average Resolution Time & Reports by Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Manual Report Management</CardTitle>
                    <CardDescription>Average Resolution Time: {avgReportResolutionTimeDays?.toFixed(2) || 'N/A'} days</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsByStatusChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Daily Active Students */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5"/> Daily Active Students</CardTitle>
                    <CardDescription>Students who showed activity (e.g., login, report, chat) within the period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyActiveStudentsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Active Students" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}