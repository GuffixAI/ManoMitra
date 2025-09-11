// web/app/(dashboard)/student/my-pathways/page.tsx
"use client";

import { useMyPathways } from "@/hooks/api/usePathways";
import { Spinner } from "@/components/ui/spinner";
import { LearningPathwayDisplay } from "@/components/pathways/LearningPathwayDisplay";
import { BookHeart } from "lucide-react";

export default function MyPathwaysPage() {
    const { data: pathways, isLoading } = useMyPathways();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Learning Pathways</h1>
            <p className="text-muted-foreground">
                Here are the personalized learning pathways generated from your AI reports.
            </p>

            {isLoading && (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            )}

            {!isLoading && (!pathways || pathways.length === 0) && (
                 <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <BookHeart className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">You don't have any learning pathways yet.</h3>
                    <p>Go to an AI Report and click "Generate My Learning Pathway" to get started.</p>
                </div>
            )}
            
            <div className="space-y-6">
                {pathways?.map((pathway: any) => (
                    <LearningPathwayDisplay key={pathway._id} pathway={pathway} />
                ))}
            </div>
        </div>
    );
}