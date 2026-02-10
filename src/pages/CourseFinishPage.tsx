import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Copy, CheckCircle2, PlayCircle, ArrowLeft } from "lucide-react";
import { getCourseById } from "@/services/courseService";
import Logo from "@/components/Logo";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";

const getCourseImage = (category: string) => {
  const categoryImages: Record<string, string> = {
    programming: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
    health: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    creative: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    business: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop",
    music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
    design: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
  };
  const key = category?.toLowerCase() || "";
  return categoryImages[key] || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop";
};

const CourseFinishPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const courseUrl = `${window.location.origin}/course/${id}`;

  useEffect(() => {
    const loadCourse = async () => {
      if (location.state?.courseData) {
        setCourseData(location.state.courseData);
        setLoading(false);
        return;
      }
      if (id) {
        try {
          const course = await getCourseById(id);
          if (course) setCourseData(course);
        } catch (error) {
          console.error("Error loading course:", error);
        }
      }
      setLoading(false);
    };
    loadCourse();
  }, [id, location.state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(courseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!courseData) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-muted-foreground">Course not found</p>
      <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
        Back to Dashboard
      </button>
    </div>
  );

  const bannerImage = getCourseImage(courseData.category);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Logo size="small" />
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
          {user?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Congrats! Your course is Ready
          </h1>
        </div>

        {/* Course Card */}
        <div className="border border-border rounded-2xl p-8 mb-8 bg-card">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left - Course info + Start button */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {courseData.name || courseData.Name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {courseData.description || courseData.Description || "No description available."}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
                <BookOpen className="h-3 w-3" />
                {courseData.category}
              </div>

              {/* Start button under description */}
              <button
                onClick={() => navigate(`/course/${id}/start`, { state: { courseData } })}
                className="w-full mt-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start
              </button>
            </div>

            {/* Right - Banner image */}
            <div className="w-full md:w-72 h-44 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <img src={bannerImage} alt={courseData.name || "Course"} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Course URL */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-2">Course URL:</p>
          <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-3 bg-card">
            <span className="text-sm text-muted-foreground flex-1 truncate">{courseUrl}</span>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500">Copied!</span>
                </>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFinishPage;
