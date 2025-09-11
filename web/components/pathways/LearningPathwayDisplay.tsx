// web/components/pathways/LearningPathwayDisplay.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMarkStepComplete } from "@/hooks/api/usePathways";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";
import { Badge } from "../ui/badge";

export const LearningPathwayDisplay = ({ pathway }: { pathway: any }) => {
    const markCompleteMutation = useMarkStepComplete();

    const handleStepToggle = (resourceId: string) => {
        markCompleteMutation.mutate({ pathwayId: pathway._id, resourceId });
    };
    
    const completedSteps = pathway.steps.filter((step: any) => step.completed).length;
    const totalSteps = pathway.steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{pathway.title}</CardTitle>
                        <CardDescription>
                            Based on your AI report from {dayjs(pathway.basedOnAIReport.createdAt).format("MMM D, YYYY")}
                        </CardDescription>
                    </div>
                    <Badge variant={progress === 100 ? "default" : "secondary"}>
                        {completedSteps} / {totalSteps} Completed
                    </Badge>
                </div>
                 <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {pathway.steps.map((step: any, index: number) => (
                    <div key={step.resource} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                            <Checkbox
                                id={`step-${step.resource}`}
                                checked={step.completed}
                                onCheckedChange={() => handleStepToggle(step.resource)}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor={`step-${step.resource}`} className="font-semibold block cursor-pointer">
                                Step {index + 1}: {step.title}
                            </label>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <Button variant="link" asChild className="p-0 h-auto mt-1">
                                <Link href={step.url} target="_blank">
                                    View Resource <ExternalLink className="ml-2 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};