// FILE: web/components/ai-reports/DemoReportDisplay.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReportSection, ResourceCard } from "./ui-elements";
import { CheckCircle, Heart, Video, BookOpen, Building } from "lucide-react";

// Helper to check if a resource array is valid and not empty
const hasResources = (resources: any[] | undefined): boolean => Array.isArray(resources) && resources.length > 0;

export const DemoReportDisplay = ({ report }: { report: any }) => {
    // Return null or a message if the report is not available
    if (!report) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Report Not Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There was an issue loading the report data.</p>
                </CardContent>
            </Card>
        );
    }

    const {
        student_summary,
        key_takeaways,
        suggested_first_steps,
        helpful_resources,
        message_of_encouragement,
    } = report;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Personalized Wellness Summary</CardTitle>
                <CardDescription>
                    Here are some insights and resources based on your recent conversation.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Student Summary */}
                {student_summary && (
                    <blockquote className="mt-6 border-l-2 pl-6 italic">
                        "{student_summary}"
                    </blockquote>
                )}

                {/* Key Takeaways */}
                {hasResources(key_takeaways) && (
                    <ReportSection title="Key Takeaways">
                        <div className="flex flex-wrap gap-2">
                            {key_takeaways.map((item: string, index: number) => (
                                <Badge key={index} variant="secondary">{item}</Badge>
                            ))}
                        </div>
                    </ReportSection>
                )}

                {/* Suggested First Steps */}
                {hasResources(suggested_first_steps) && (
                     <ReportSection title="Suggested First Steps">
                        <ul className="space-y-3">
                            {suggested_first_steps.map((step: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </ReportSection>
                )}

                {/* Helpful Resources */}
                {helpful_resources && (
                    <ReportSection title="Helpful Resources">
                        <div className="space-y-6">
                            {hasResources(helpful_resources.videos_and_audio) && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Video className="h-5 w-5"/>Videos & Audio</h4>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {helpful_resources.videos_and_audio.map((res: any, i: number) => <ResourceCard key={`video-${i}`} {...res} />)}
                                    </div>
                                </div>
                            )}
                            {hasResources(helpful_resources.articles_and_guides) && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5"/>Articles & Guides</h4>
                                     <div className="grid md:grid-cols-2 gap-4">
                                        {helpful_resources.articles_and_guides.map((res: any, i: number) => <ResourceCard key={`article-${i}`} {...res} />)}
                                    </div>
                                </div>
                            )}
                             {hasResources(helpful_resources.on_campus_support) && (
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Building className="h-5 w-5"/>On-Campus Support</h4>
                                     <div className="grid md:grid-cols-2 gap-4">
                                        {helpful_resources.on_campus_support.map((res: any, i: number) => <ResourceCard key={`support-${i}`} {...res} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ReportSection>
                )}

                {/* Message of Encouragement */}
                {message_of_encouragement && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                        <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">A Message for You</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            {message_of_encouragement}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};