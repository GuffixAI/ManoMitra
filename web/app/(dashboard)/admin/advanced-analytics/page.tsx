// FILE: web/app/(dashboard)/admin/advanced-analytics/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useTriggerAdvancedAnalytics, useLatestAdvancedAnalytics, useAllAnalyticsVersions, useAdvancedAnalyticsById } from "@/hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, RefreshCw, AreaChart, TrendingUp, Users, Heart, ShieldAlert, BookOpen, Clock, CalendarDays, FileText } from "lucide-react";
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { AnalyticsSnapshot } from "@/types/analytics";
import { Badge } from "@/components/ui/badge";

import { useGetInterventions } from "@/hooks/api/useInterventions";
import { ChevronsRight } from "lucide-react";

const ComparisonCard = ({ title, valueA, valueB, format = (v) => v.toFixed(2) }: { title: string, valueA?: number, valueB?: number, format?: (v: number) => string }) => {
    const valA = valueA ?? 0;
    const valB = valueB ?? 0;
    const change = valB - valA;
    const changePercent = valA !== 0 ? (change / valA) * 100 : 0;
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
        <Card className="text-center">
            <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent>
                <div className="flex justify-center items-baseline gap-4">
                    <span className="text-2xl font-bold">{format(valA)}</span>
                    <ChevronsRight className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{format(valB)}</span>
                </div>
                <div className={`mt-2 font-semibold ${isPositive ? 'text-red-500' : isNegative ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {change.toFixed(2)} ({changePercent.toFixed(1)}%)
                </div>
            </CardContent>
        </Card>
    );
};


// Helper function to prepare data for charts
const prepareChartData = (data: { [key: string]: number }) => 
  Object.entries(data).map(([name, value]) => ({ name, value }));

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c'];

export default function AdminAdvancedAnalyticsPage() {
    const triggerAnalyticsMutation = useTriggerAdvancedAnalytics();
    const { data: latestAnalytics, isLoading: isLoadingLatest, refetch: refetchLatest } = useLatestAdvancedAnalytics();
    const { data: versionsData, isLoading: isLoadingVersions } = useAllAnalyticsVersions();


    const { data: interventions } = useGetInterventions();

    const [interventionId, setInterventionId] = useState<string | undefined>();
    const [snapshotAId, setSnapshotAId] = useState<string | undefined>();
    const [snapshotBId, setSnapshotBId] = useState<string | undefined>();

    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | undefined>(undefined);
    const { data: displayedAnalytics, isLoading: isLoadingDisplayed } = useAdvancedAnalyticsById(selectedSnapshotId || "");

    const { data: snapshotA, isLoading: isLoadingA } = useAdvancedAnalyticsById(snapshotAId || "");
    const { data: snapshotB, isLoading: isLoadingB } = useAdvancedAnalyticsById(snapshotBId || "");
    
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
                refetchLatest();
                setSelectedSnapshotId(response.snapshot_id);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to generate analytics.");
            },
        });
    };

     const handleInterventionChange = (id: string) => {
        setInterventionId(id);
        const intervention = interventions?.find((i: any) => i._id === id);
        if (!intervention || !versionsData) {
            setSnapshotAId(undefined);
            setSnapshotBId(undefined);
            return;
        }

        const beforeSnapshots = versionsData
            .filter((v: any) => dayjs(v.snapshotTimestamp).isBefore(dayjs(intervention.startDate)))
            .sort((a: any, b: any) => dayjs(b.snapshotTimestamp).diff(dayjs(a.snapshotTimestamp)));
        
        const afterSnapshots = versionsData
            .filter((v: any) => dayjs(v.snapshotTimestamp).isAfter(dayjs(intervention.endDate)))
            .sort((a: any, b: any) => dayjs(a.snapshotTimestamp).diff(dayjs(b.snapshotTimestamp)));

        setSnapshotAId(beforeSnapshots[0]?._id);
        setSnapshotBId(afterSnapshots[0]?._id);
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
                <AreaChart className="w-24 h-24 text-muted-foreground" />
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
    } = currentAnalytics || {};

    const sentimentChartData = prepareChartData(sentimentDistribution || {});
    const riskLevelChartData = prepareChartData(riskLevelDistribution || {});
    const reportsByStatusChartData = prepareChartData(reportsByStatus || {});
    const phq9ChartData = prepareChartData(phq9Distribution || {});
    const gad7ChartData = prepareChartData(gad7Distribution || {});
    
    const topRedFlagsChartData = topRedFlags?.map(item => ({ name: (item as any).flag || item.item, value: item.count })) || [];
    const topStressorsChartData = topStressors?.map(item => ({ name: (item as any).stressor || item.item, value: item.count })) || [];
    const topStudentConcernsChartData = topStudentConcerns?.map(item => ({ name: (item as any).concern || item.item, value: item.count })) || [];
    const topSuggestedResourceTopicsChartData = topSuggestedResourceTopics?.map(item => ({ name: (item as any).topic || item.item, value: item.count })) || [];
    const topCounsellorsChartData = topCounsellorsByReportsResolved?.map(item => ({ name: item.name, value: item.resolvedCount })) || [];
    
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
                        <p className="text-2xl font-bold">{(totalReports ?? 0) + (totalAIReports ?? 0)}</p>
                        <p className="text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="text-center">
                        <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalStudentsEngaged ?? 0}</p>
                        <p className="text-muted-foreground">Students Engaged</p>
                    </div>
                    <div className="text-center">
                        <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalAIReports ?? 0}</p>
                        <p className="text-muted-foreground">AI Reports</p>
                    </div>
                    <div className="text-center">
                        <BookOpen className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{totalManualReports ?? 0}</p>
                        <p className="text-muted-foreground">Manual Reports</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Intervention Impact Analysis</CardTitle>
                    <CardDescription>Measure the impact of an intervention by comparing analytics snapshots before and after.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Select onValueChange={handleInterventionChange}>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder="Select an intervention to analyze..." />
                        </SelectTrigger>
                        <SelectContent>
                            {interventions?.map((item: any) => (
                                <SelectItem key={item._id} value={item._id}>{item.name} ({dayjs(item.startDate).format("MMM YYYY")})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    { (isLoadingA || isLoadingB) && <div className="flex justify-center"><Spinner /></div> }

                    { snapshotA && snapshotB && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                             <ComparisonCard title="Avg GAD-7 Score" valueA={snapshotA.avgGAD7} valueB={snapshotB.avgGAD7} />
                             <ComparisonCard title="Avg PHQ-9 Score" valueA={snapshotA.avgPHQ9} valueB={snapshotB.avgPHQ9} />
                             <ComparisonCard title="Students Engaged" valueA={snapshotA.totalStudentsEngaged} valueB={snapshotB.totalStudentsEngaged} format={v => v.toString()}/>
                        </div>
                    )}
                     { interventionId && (!snapshotA || !snapshotB) && !(isLoadingA || isLoadingB) &&
                        <p className="text-center text-muted-foreground pt-4 border-t">Could not find suitable before/after snapshots for this intervention.</p>
                     }
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    label={(entry: any) => `${entry.name} (${(entry.percent * 100).toFixed(0)}%)`}
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