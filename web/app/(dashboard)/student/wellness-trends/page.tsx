// web/app/(dashboard)/student/wellness-trends/page.tsx
"use client";
import { useGetCheckinHistory, useSubmitCheckin } from "@/hooks/api/useStudents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Smile, Frown, Meh, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from "dayjs";

const moodEmojis = [
  { score: 1, icon: <Frown className="h-8 w-8 text-red-500" />, label: "Very Bad" },
  { score: 2, icon: <Frown className="h-8 w-8 text-orange-500" />, label: "Bad" },
  { score: 3, icon: <Meh className="h-8 w-8 text-yellow-500" />, label: "Okay" },
  { score: 4, icon: <Smile className="h-8 w-8 text-lime-500" />, label: "Good" },
  { score: 5, icon: <Smile className="h-8 w-8 text-green-500" />, label: "Very Good" },
];

export default function WellnessTrendsPage() {
  const { data: history, isLoading: isLoadingHistory } = useGetCheckinHistory();
  const submitCheckinMutation = useSubmitCheckin();
  const { register, handleSubmit, reset } = useForm();
  const [mood, setMood] = useState(0);
  const [stress, setStress] = useState(0);

  const onSubmit = (data: any) => {
    if (mood === 0 || stress === 0) {
      alert("Please select your mood and stress level.");
      return;
    }
    submitCheckinMutation.mutate({ moodScore: mood, stressLevel: stress, ...data }, {
        onSuccess: () => {
            reset();
            setMood(0);
            setStress(0);
        }
    });
  };

  const chartData = history?.map((item: any) => ({
    date: dayjs(item.createdAt).format("MMM D"),
    Mood: item.moodScore,
    Stress: item.stressLevel,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Wellness Trends</h1>
      
      <Card>
        <CardHeader><CardTitle>Log Today's Check-in</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>How are you feeling today?</Label>
              <div className="flex justify-around p-4">
                {moodEmojis.map(({ score, icon, label }) => (
                  <div key={score} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setMood(score)}>
                    <div className={`p-2 rounded-full transition-all ${mood === score ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}>{icon}</div>
                    <span className={`text-xs ${mood === score ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
             <div>
                <Label>How would you rate your stress level? (1=Low, 5=High)</Label>
                <div className="flex justify-around items-center p-4">
                    {[1, 2, 3, 4, 5].map(level => (
                        <button key={level} type="button" onClick={() => setStress(level)} className={`h-10 w-10 rounded-full transition-all flex items-center justify-center font-bold ${stress === level ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{level}</button>
                    ))}
                </div>
            </div>
            <div>
              <Label htmlFor="feedback">Anything else on your mind? (Optional)</Label>
              <Textarea id="feedback" {...register("openEndedFeedback")} />
            </div>
            <Button type="submit" disabled={submitCheckinMutation.isPending}>
              {submitCheckinMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Submit Check-in
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 /> Your 90-Day Trend</CardTitle>
          <CardDescription>Visualize your mood and stress levels over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? <div className="flex justify-center"><Spinner /></div> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Mood" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Stress" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}