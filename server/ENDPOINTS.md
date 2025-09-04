### General & Health Check

*   `GET /health` - Checks if the server is running and provides environment info.

---

### `##  Authentication (/api/auth)`

*   `POST /api/auth/login` - Universal login for any user role (student, counsellor, etc.).
*   `POST /api/auth/student/login` - Specific login endpoint for students.
*   `POST /api/auth/counsellor/login` - Specific login endpoint for counsellors.
*   `POST /api/auth/volunteer/login` - Specific login endpoint for volunteers.
*   `POST /api/auth/admin/login` - Specific login endpoint for admins.
*   `POST /api/auth/student/register` - Register a new student account.
*   `POST /api/auth/counsellor/register` - Register a new counsellor account.
*   `POST /api/auth/volunteer/register` - Register a new volunteer account.
*   `POST /api/auth/change-password` - Change the password for the currently logged-in user. `(Requires Authentication)`
*   `GET /api/auth/me` - Verify the current token and get the user's details. `(Requires Authentication)`
*   `POST /api/auth/refresh` - Generate a new JWT token for the currently logged-in user. `(Requires Authentication)`
*   `POST /api/auth/socket-token` - Generate a short-lived token for authenticating a WebSocket connection. `(Requires Authentication)`
*   `POST /api/auth/logout` - Logs the user out (instructs the client to clear credentials).

---

### `## Students (/api/students)`
*(All endpoints require Student Role authentication)*

*   `GET /api/students/profile` - Get the logged-in student's profile.
*   `PUT /api/students/profile` - Update the logged-in student's profile.
*   `GET /api/students/dashboard` - Get dashboard statistics for the student.
*   `GET /api/students/counsellors` - Get a list of available counsellors.
*   `GET /api/students/volunteers` - Get a list of available volunteers.
*   `GET /api/students/connections` - Get the student's connected counsellors and volunteers.
*   `POST /api/students/counsellors/connect` - Connect with a counsellor.
*   `DELETE /api/students/counsellors/:counsellorId` - Disconnect from a counsellor.
*   `POST /api/students/volunteers/connect` - Connect with a volunteer.
*   `DELETE /api/students/volunteers/:volunteerId` - Disconnect from a volunteer.
*   `PUT /api/students/preferences` - Update the student's preferences.
*   `POST /api/students/activity` - Update the student's "last active" timestamp.

---

### `## Counsellors (/api/counsellors)`

*   `GET /api/counsellors/:id/availability` - Get the availability for a specific counsellor. `(Public)`
*   `GET /api/counsellors/profile` - Get the logged-in counsellor's profile. `(Requires Counsellor Role)`
*   `PUT /api/counsellors/profile` - Update the logged-in counsellor's profile. `(Requires Counsellor Role)`
*   `GET /api/counsellors/students` - Get the list of students connected to the counsellor. `(Requires Counsellor Role)`
*   `POST /api/counsellors/students` - Manually add a student to the counsellor's list. `(Requires Counsellor Role)`
*   `DELETE /api/counsellors/students/:studentId` - Remove a student from the counsellor's list. `(Requires Counsellor Role)`
*   `GET /api/counsellors/schedule` - Get the counsellor's schedule (availability and bookings). `(Requires Counsellor Role)`
*   `PUT /api/counsellors/availability` - Update the counsellor's availability schedule. `(Requires Counsellor Role)`
*   `GET /api/counsellors/reports` - Get reports assigned to the counsellor. `(Requires Counsellor Role)`
*   `GET /api/counsellors/performance` - Get performance metrics for the counsellor. `(Requires Counsellor Role)`
*   `GET /api/counsellors/dashboard` - Get dashboard statistics for the counsellor. `(Requires Counsellor Role)`

---

### `## Volunteers (/api/volunteers)`
*(All endpoints require Volunteer Role authentication)*

*   `GET /api/volunteers/profile` - Get the logged-in volunteer's profile.
*   `PUT /api/volunteers/profile` - Update the logged-in volunteer's profile.
*   `GET /api/volunteers/dashboard` - Get dashboard statistics for the volunteer.
*   `GET /api/volunteers/performance` - Get performance metrics for the volunteer.
*   `GET /api/volunteers/rooms` - Get the peer support rooms moderated by the volunteer.
*   `GET /api/volunteers/messages` - Get the volunteer's message history.
*   `POST /api/volunteers/training/complete` - Mark the volunteer's training as complete.
*   `GET /api/volunteers/availability` - Get the volunteer's current availability status.
*   `PUT /api/volunteers/availability` - Update the volunteer's availability status.
*   `POST /api/volunteers/activity` - Update the volunteer's "last active" timestamp.
*   `GET /api/volunteers/feedback` - Get feedback submitted for the volunteer.

---

### `## Admin (/api/admin)`
*(All endpoints require Admin Role authentication)*

*   `GET /api/admin/profile` - Get the logged-in admin's own profile.
*   `PUT /api/admin/profile` - Update the logged-in admin's own profile.
*   `GET /api/admin/dashboard/stats` - Get high-level dashboard statistics for the entire system.
*   `GET /api/admin/analytics` - Get system analytics over a specified period.
*   `GET /api/admin/users/students` - Get a list of all students.
*   `GET /api/admin/users/counsellors` - Get a list of all counsellors.
*   `GET /api/admin/users/volunteers` - Get a list of all volunteers.
*   `GET /api/admin/users/:userModel/:userId` - Get detailed information for a specific user by their ID and role.
*   `PATCH /api/admin/users/status` - Activate or deactivate a user account.
*   `GET /api/admin/reports` - Get a list of all reports in the system.
*   `PATCH /api/admin/reports/assign` - Assign a report to a counsellor.
*   `POST /api/admin/emergency` - Perform an emergency action (e.g., suspend a user).

---

### `## Bookings (/api/bookings)`

*   `GET /api/bookings/slots/:counsellorId` - Get available booking slots for a specific counsellor. `(Public)`
*   `POST /api/bookings/student` - Create a new booking request. `(Requires Student Role)`
*   `GET /api/bookings/student` - Get the student's own bookings. `(Requires Student Role)`
*   `GET /api/bookings/student/:id` - Get a single booking by ID. `(Requires Student Role)`
*   `DELETE /api/bookings/student/:id` - Cancel a booking. `(Requires Student Role)`
*   `GET /api/bookings/counsellor` - Get all bookings for the logged-in counsellor. `(Requires Counsellor Role)`
*   `PUT /api/bookings/counsellor/:id/confirm` - Confirm a pending booking. `(Requires Counsellor Role)`
*   `PUT /api/bookings/counsellor/:id/reject` - Reject a pending booking. `(Requires Counsellor Role)`
*   `PUT /api/bookings/counsellor/:id/complete` - Mark an approved booking as completed. `(Requires Counsellor Role)`
*   `GET /api/bookings/admin/stats` - Get booking statistics for the admin dashboard. `(Requires Admin Role)`

---

### `## Reports (/api/reports)`

*   `POST /api/reports` - Create a new report. `(Requires Student Role)`
*   `GET /api/reports/my` - Get the student's own reports. `(Requires Student Role)`
*   `GET /api/reports/my/:id` - Get a specific report by ID that the student owns. `(Requires Student Role)`
*   `PUT /api/reports/my/:id` - Update a student's own report (if status is 'pending'). `(Requires Student Role)`
*   `DELETE /api/reports/my/:id` - Delete a student's own report (if status is 'pending'). `(Requires Student Role)`
*   `GET /api/reports/assigned` - Get reports assigned to the logged-in counsellor. `(Requires Counsellor Role)`
*   `GET /api/reports/assigned/:id` - Get details of a specific report assigned to the counsellor. `(Requires Counsellor Role)`
*   `PATCH /api/reports/assigned/:id/status` - Update the status of an assigned report. `(Requires Counsellor Role)`
*   `GET /api/reports/urgent` - Get a list of all urgent reports. `(Requires Admin or Counsellor Role)`
*   `GET /api/reports/status` - Get reports filtered by a specific status. `(Requires Admin or Counsellor Role)`

---

### `## Feedback (/api/feedback)`

*   `GET /api/feedback/top-rated` - Get a list of the top-rated counsellors and volunteers. `(Requires Authentication)`
*   `GET /api/feedback/stats` - Get aggregated feedback statistics. `(Requires Admin Role)`
*   `GET /api/feedback/:targetType/:targetId` - Get all feedback for a specific counsellor or volunteer. `(Requires Authentication)`
*   `POST /api/feedback` - Submit new feedback for a counsellor or volunteer. `(Requires Student Role)`
*   `GET /api/feedback/my` - Get all feedback submitted by the logged-in student. `(Requires Student Role)`
*   `PUT /api/feedback/:id` - Update feedback that the student previously submitted. `(Requires Student Role)`
*   `DELETE /api/feedback/:id` - Delete feedback that the student previously submitted. `(Requires Student Role)`

---

### `## Peer Support Rooms (/api/rooms)`
*(Most are public, allowing users to see rooms before joining via WebSocket)*

*   `GET /api/rooms` - Get a list of all available peer support rooms. `(Public)`
*   `GET /api/rooms/:topic` - Get details for a room by its topic. `(Public)`
*   `GET /api/rooms/:topic/messages` - Get message history for a specific room. `(Public)`
*   `GET /api/rooms/:topic/stats` - Get statistics for a specific room. `(Public)`
*   `GET /api/rooms/:topic/activity` - Get recent activity for a specific room. `(Public)`
*   `POST /api/rooms/moderators` - Add a volunteer as a moderator to a room. `(Requires Admin Role)`
*   `DELETE /api/rooms/:topic/moderators/:volunteerId` - Remove a moderator from a room. `(Requires Admin Role)`
*   `PUT /api/rooms/:topic/description` - Update a room's description. `(Requires Admin Role)`

---

### `## Notifications (/api/notifications)`
*(All endpoints require authentication)*

*   `GET /api/notifications` - Get notifications for the logged-in user.
*   `GET /api/notifications/unread` - Get the count of unread notifications.
*   `GET /api/notifications/preferences` - Get the user's notification preferences.
*   `PUT /api/notifications/preferences` - Update the user's notification preferences.
*   `PUT /api/notifications/:id/read` - Mark a specific notification as read.
*   `PUT /api/notifications/read-all` - Mark all of the user's notifications as read.
*   `PUT /api/notifications/:id/archive` - Archive a notification.
*   `PUT /api/notifications/:id/unarchive` - Unarchive a notification.
*   `DELETE /api/notifications/:id` - Delete a notification.
*   `GET /api/notifications/admin/user/:userId/:userModel` - Get all notifications for a specific user. `(Requires Admin Role)`
*   `POST /api/notifications/admin/system` - Send a system-wide notification. `(Requires Admin Role)`
*   `GET /api/notifications/admin/stats` - Get notification statistics. `(Requires Admin Role)`
*   `POST /api/notifications/admin/cleanup` - Clean up (archive) expired notifications. `(Requires Admin Role)`