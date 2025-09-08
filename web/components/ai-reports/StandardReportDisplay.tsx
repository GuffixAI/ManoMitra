// FILE: web/components/ai-reports/StandardReportDisplay.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportSection, StatCard, ScoreIndicator, ResourceLinkCard } from "./ui-elements";
import { Thermometer, Activity, ShieldAlert, ListChecks, FlaskConical, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

// Helper to get color class based on risk level
const getRiskColor = (level?: string): string => {
    if (!level) return "text-gray-500";
    switch (level.toLowerCase()) {
        case 'high': return 'text-red-500';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-green-500';
        default: return 'text-gray-500';
    }
};

export const StandardReportDisplay = ({ report }: { report: any }) => {
    if (!report) return null;

    const { risk_assessment, screening_scores, counselor_recommendations, analytics, chat_summary, report_generated_at } = report;

    const riskColor = getRiskColor(risk_assessment?.risk_level);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Clinical & Administrative Summary</CardTitle>
                    <CardDescription>
                       {chat_summary} (Generated on {new Date(report_generated_at).toLocaleString()})
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* LEFT COLUMN: AT-A-GLANCE ASSESSMENTS */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Risk Assessment Card */}
                    {risk_assessment && (
                        <Card className="border-2 border-l-4" style={{ borderLeftColor: riskColor.includes('red') ? 'hsl(var(--destructive))' : riskColor.includes('yellow') ? 'hsl(var(--primary))' : 'hsl(var(--success))' }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" /> Risk Assessment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <StatCard 
                                    label="Overall Risk Level" 
                                    value={risk_assessment.risk_level || 'N/A'} 
                                    icon={ShieldAlert}
                                    color={riskColor}
                                />
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <StatCard label="Sentiment" value={risk_assessment.sentiment || 'N/A'} icon={Thermometer}/>
                                    <StatCard label="Intensity" value={risk_assessment.emotional_intensity || 'N/A'} icon={Activity}/>
                                </div>
                                {risk_assessment.red_flags?.length > 0 && (
                                    <div className="pt-2">
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/> Red Flags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {risk_assessment.red_flags.map((flag: string, i: number) => <Badge key={i} variant="destructive">{flag}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Screening Scores Card */}
                     {screening_scores && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Screening Scores (Estimated)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <ScoreIndicator 
                                    title="PHQ-9 (Depression)"
                                    score={screening_scores.phq_9_score ?? 0}
                                    maxScore={27}
                                    interpretation="Mild depression symptoms indicated."
                                    colorClass="bg-yellow-500"
                               />
                               <ScoreIndicator 
                                    title="GAD-7 (Anxiety)"
                                    score={screening_scores.gad_7_score ?? 0}
                                    maxScore={21}
                                    interpretation="Mild anxiety symptoms indicated."
                                    colorClass="bg-blue-500"
                               />
                                {screening_scores.interpretation && (
                                     <p className="text-sm text-muted-foreground pt-2 border-t mt-4 italic">{screening_scores.interpretation}</p>
                                )}
                            </CardContent>
                         </Card>
                     )}
                </div>

                {/* RIGHT COLUMN: RECOMMENDATIONS & ANALYTICS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Counselor Recommendations Card */}
                    {counselor_recommendations && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/>Counselor Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {counselor_recommendations.suggested_next_steps?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Suggested Next Steps</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm bg-muted/50 p-4 rounded-md">
                                            {counselor_recommendations.suggested_next_steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {counselor_recommendations.recommended_resources?.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-sm mb-3">Recommended Resources</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {counselor_recommendations.recommended_resources.map((res: any, i: number) => (
                                                <ResourceLinkCard key={i} {...res} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Clinical Analytics Card */}
                    {analytics && (
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5"/>Clinical Analytics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {analytics.key_stressors_identified?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Key Stressors Identified</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analytics.key_stressors_identified.map((s: string, i: number) => <Badge key={i} variant="default">{s}</Badge>)}
                                        </div>
                                    </div>
                                )}
                                {analytics.potential_underlying_issues?.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Potential Underlying Issues</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analytics.potential_underlying_issues.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                         </Card>
                    )}
                </div>
            </div>
        </div>
    );
};