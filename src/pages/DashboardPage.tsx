import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";
import { getUserCourses } from "@/services/courseService";
import { Loader2 } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user?.email) {
        try {
          const userCourses = await getUserCourses(user.email);
          setCourses(userCourses);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      }
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hello, <span className="font-extrabold">{user?.displayName || "User"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create new course with AI, Share with friends and Earn from it
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/create-course")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-dark transition-colors duration-150"
          >
            + Create AI Course
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-4">My Courses</h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
          <button
            onClick={() => navigate("/create-course")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-dark transition-colors duration-150"
          >
            + Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              {...course}
              onDelete={(deletedId) => setCourses(courses.filter(c => c.id !== deletedId))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
