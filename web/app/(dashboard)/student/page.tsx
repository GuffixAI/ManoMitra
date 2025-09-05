"use client";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { studentAPI } from "@/lib/api";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Bell, 
  Settings,
  Plus,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import dayjs from "dayjs";
import { useStudentDashboard } from "@/hooks/api/useStudents"; 

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: dashboardData, isLoading } = useStudentDashboard();

  // // Fetch dashboard data
  // const { data: dashboardData, isLoading } = useQuery({
  //   queryKey: ['student-dashboard'],
  //   queryFn: () => studentAPI.getDashboard(), // This now returns the correct data shape
  //   enabled: !!user
  // });

  const StatCard = ({ title, value, icon: Icon, link, linkText, colorClass = "text-primary" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {link && (
          <Link href={link} className="text-xs text-muted-foreground flex items-center hover:text-primary mt-1">
            {linkText} <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading || !dashboardData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's a summary of your mental wellness journey.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* FIX: Added optional chaining for safety */}
        <StatCard 
            title="Upcoming Bookings" 
            value={dashboardData?.bookings?.pending ?? 0}
            icon={Calendar} 
            link="/student/bookings" 
            linkText="View Bookings"
        />
        <StatCard 
            title="Active Reports" 
            value={dashboardData?.reports?.pending ?? 0}
            icon={FileText} 
            link="/student/reports" 
            linkText="View Reports"
            colorClass="text-blue-500"
        />
        <StatCard 
            title="Total Connections" 
            value={dashboardData?.connections ?? 0}
            icon={Users} 
            link="/student/counsellors"
            linkText="Manage Connections" 
            colorClass="text-green-500"
        />
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 ">
              <Link href="/student/bookings">
                <Button variant="outline" className="w-full justify-start cursor-pointer mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book a Counselling Session
                </Button>
              </Link>
              <Link href="/student/create-report">
                <Button variant="outline" className="w-full justify-start cursor-pointer mb-2">
                  <FileText className="mr-2 h-4 w-4" />
                  Create a New Confidential Report
                </Button>
              </Link>
              <Link href="/chat/general">
                <Button variant="outline" className="w-full justify-start cursor-pointer ">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Join a Peer Support Room
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Bookings */}
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* This part would be implemented with a dedicated activity endpoint */}
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity to show.</p>
                  </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}