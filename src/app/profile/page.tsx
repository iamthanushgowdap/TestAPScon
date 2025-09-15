// app/profile/page.tsx (Server Component, no "use client")

import AppLayout from "@/components/app-layout";
import StudentProfile from "@/components/profile/student-profile";
import FacultyProfile from "@/components/profile/faculty-profile";
import AdminProfile from "@/components/profile/admin-profile";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] };
}) {
  const role =
    typeof searchParams?.role === "string" ? searchParams.role : undefined;

  const renderProfile = () => {
    switch (role) {
      case "student":
        return <StudentProfile />;
      case "faculty":
        return <FacultyProfile />;
      case "admin":
        return <AdminProfile />;
      default:
        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        );
    }
  };

  return <AppLayout>{renderProfile()}</AppLayout>;
}
