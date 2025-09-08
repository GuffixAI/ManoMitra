// FILE: web/app/(dashboard)/student/ai-reports/[id]/page.tsx
"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGetAIReportById } from '@/hooks/api/useAIReports';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth.store';
import { ROLES } from '@/lib/constants';

// Import the display components
import { DemoReportDisplay } from '@/components/ai-reports/DemoReportDisplay';
import { StandardReportDisplay } from '@/components/ai-reports/StandardReportDisplay';

export default function AIReportDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuthStore();
    const { data: report, isLoading } = useGetAIReportById(id);

    // Memoize the parsed JSON to prevent re-parsing on every render
    const parsedDemoReport = useMemo(() => {
        if (!report?.demo_report?.demo_content) return null;
        try {
            return JSON.parse(report.demo_report.demo_content);
        } catch (e) {
            console.error("Failed to parse demo report:", e);
            return null;
        }
    }, [report]);

    const parsedStandardReport = useMemo(() => {
        if (!report?.standard_report?.standard_content) return null;
        try {
            return JSON.parse(report.standard_report.standard_content);
        } catch (e) {
            console.error("Failed to parse standard report:", e);
            return null;
        }
    }, [report]);

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (!report || !parsedDemoReport) {
        return <p>Report not found or data is corrupted.</p>;
    }
    
    // Determine if the user has a role that can see the professional view
    // const canViewStandardReport = user?.role === ROLES.ADMIN || user?.role === ROLES.COUNSELLOR;
    const canViewStandardReport =  true

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI Wellness Report</h1>
            <p className="text-muted-foreground">Generated on: {new Date(report.createdAt).toLocaleString()}</p>

            <Tabs defaultValue="student_view" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 sm:max-w-md">
                    <TabsTrigger value="student_view">For You (Student View)</TabsTrigger>
                    {/* Conditionally render the professional view tab */}
                    {canViewStandardReport && (
                        <TabsTrigger value="professional_view">Technical View</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="student_view" className="mt-4">
                    <DemoReportDisplay report={parsedDemoReport} />
                </TabsContent>

                {canViewStandardReport && (
                    <TabsContent value="professional_view" className="mt-4">
                        {parsedStandardReport ? (
                            <StandardReportDisplay report={parsedStandardReport} />
                        ) : (
                            <p>Could not load the professional report data.</p>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}