// FILE: web/components/ai-reports/ui-elements.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, Link as LinkIcon, ExternalLink } from "lucide-react";
import Image from 'next/image';

// A generic section wrapper for consistency
export const ReportSection = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={cn("w-full", className)}>
        <h3 className="text-md font-semibold mb-3 px-1 flex items-center">{title}</h3>
        {children}
    </div>
);

// A card for displaying key statistics
export const StatCard = ({ label, value, icon: Icon, color = "text-primary" }: { label: string; value: string | number; icon: LucideIcon, color?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={cn("h-4 w-4 text-muted-foreground", color)} />
        </CardHeader>
        <CardContent>
            <div className={cn("text-2xl font-bold", color)}>{value}</div>
        </CardContent>
    </Card>
);

// A visual indicator for screening scores like PHQ-9 and GAD-7
export const ScoreIndicator = ({ title, score, maxScore, interpretation, colorClass = "bg-blue-500" }: { title: string; score: number; maxScore: number; interpretation: string; colorClass?: string; }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-baseline">
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-lg font-bold">{score}<span className="text-sm font-normal text-muted-foreground">/{maxScore}</span></p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
            <div className={cn("h-2 rounded-full", colorClass)} style={{ width: `${(score / maxScore) * 100}%` }} />
        </div>
        <p className="text-xs text-muted-foreground italic">{interpretation}</p>
    </div>
);

// A card for displaying a recommended resource link
export const ResourceLinkCard = ({ category, title, url, relevance }: { category: string, title: string, url: string, relevance: string }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="border rounded-lg p-4 h-full hover:border-primary/80 hover:bg-muted/50 transition-all">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{category}</Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-semibold group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{relevance}</p>
        </div>
    </a>
);


/**
 * Extracts YouTube video ID from various URL formats.
 * @param url The YouTube URL
 * @returns The video ID or null if not found.
 */
const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};


// A dynamic card for displaying a student-facing resource (video, article, etc.)
export const ResourceCard = ({ title, url, description }: { title: string, url: string, description?: string }) => {
    const videoId = getYoutubeVideoId(url);

    if (videoId) {
        // Render a rich card for YouTube videos
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
                <Card className="hover:border-primary transition-colors h-full flex flex-col">
                    <div className="relative aspect-video w-full overflow-hidden">
                         <Image
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={`Thumbnail for ${title}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                    <CardContent className="pt-4 flex-grow">
                        <p className="font-semibold leading-snug group-hover:text-primary transition-colors">{title}</p>
                    </CardContent>
                </Card>
            </a>
        );
    }
    
    // Render a simpler card for articles and other links
    return (
         <a href={url} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="hover:bg-muted/50 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6">
                    <p className="font-semibold mb-1 flex items-start gap-2">
                        <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                        <span>{title}</span>
                    </p>
                    {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
                </CardContent>
            </Card>
        </a>
    );
};