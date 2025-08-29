// Comprehensive student dashboard with all features
"use client";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { studentAPI, bookingAPI, reportAPI, notificationAPI } from "@/lib/api";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Bell, 
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  BookOpen
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentAPI.getDashboard,
    enabled: !!user
  });

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['student-bookings'],
    queryFn: () => bookingAPI.getMyBookings({ limit: 5 }),
    enabled: !!user
  });

  // Fetch recent reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['student-reports'],
    queryFn: () => reportAPI.getMyReports({ limit: 5 }),
    enabled: !!user
  });

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['student-notifications'],
    queryFn: () => notificationAPI.getUserNotifications({ limit: 5, unreadOnly: true }),
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isLoading = dashboardLoading || bookingsLoading || reportsLoading || notificationsLoading;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your mental wellness journey
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.upcomingSessions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Professionals</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.connectedProfessionals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Reports</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.activeReports || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Notifications</p>
                <p className="text-2xl font-bold">
                  {notifications?.unreadCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="support">Peer Support</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recentActivity?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{activity.description}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/student/book-counsellor">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Counselling Session
                    </Button>
                  </Link>
                  <Link href="/student/create-report">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Create New Report
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Join Peer Support Room
                    </Button>
                  </Link>
                  <Link href="/student/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Update Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Link href="/student/book-counsellor">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-6">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : bookings?.bookings?.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.bookings.map((booking: any) => (
                      <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.counsellor?.name || 'Counsellor'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {booking.status}
                          </Badge>
                          <Link href={`/student/bookings/${booking._id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookings yet</p>
                    <Link href="/student/book-counsellor">
                      <Button className="mt-2">Book Your First Session</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Reports</h2>
              <Link href="/student/create-report">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-6">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : reports?.reports?.length > 0 ? (
                  <div className="space-y-4">
                    {reports.reports.map((report: any) => (
                      <div key={report._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.category} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            report.priority === 'urgent' ? 'destructive' :
                            report.priority === 'high' ? 'default' :
                            report.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {report.priority}
                          </Badge>
                          <Badge variant={
                            report.status === 'resolved' ? 'default' :
                            report.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {report.status}
                          </Badge>
                          <Link href={`/student/reports/${report._id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reports yet</p>
                    <Link href="/student/create-report">
                      <Button className="mt-2">Create Your First Report</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <h2 className="text-2xl font-bold">My Connections</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Counsellors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Connected Counsellors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.connectedCounsellors?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.connectedCounsellors.slice(0, 3).map((counsellor: any) => (
                        <div key={counsellor._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {counsellor.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{counsellor.name}</p>
                            <p className="text-sm text-muted-foreground">{counsellor.specialization}</p>
                          </div>
                          <Button variant="outline" size="sm">Book</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No counsellors connected</p>
                      <Link href="/student/counsellors">
                        <Button variant="outline" size="sm" className="mt-2">Find Counsellors</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Volunteers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Connected Volunteers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.connectedVolunteers?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.connectedVolunteers.slice(0, 3).map((volunteer: any) => (
                        <div key={volunteer._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-500">
                              {volunteer.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{volunteer.name}</p>
                            <p className="text-sm text-muted-foreground">{volunteer.skills?.join(', ')}</p>
                          </div>
                          <Button variant="outline" size="sm">Chat</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No volunteers connected</p>
                      <Link href="/student/volunteers">
                        <Button variant="outline" size="sm" className="mt-2">Find Volunteers</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Peer Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <h2 className="text-2xl font-bold">Peer Support</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Join peer support rooms to connect with fellow students</p>
                  <Link href="/chat">
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Join Support Rooms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}