import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit, BookOpen, Clock, BarChart, PlayCircle, ChevronDown, Video, Loader2 } from "lucide-react";
import { generateChapterContent, saveChapterContentToDB, getCourseById, getChaptersByCourseId } from "@/services/courseService";
import { getVideos } from "@/services/youtubeService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";

// Auto-generate a relevant banner image based on category
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

const CourseLayoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [coursePublished, setCoursePublished] = useState(false);

  // Check if current user is the course owner
  const isOwner = courseData?.createdBy && user?.email && courseData.createdBy === user.email;
  // If navigated from create page, user is the owner
  const cameFromCreate = !!location.state?.courseData;
  const canEdit = isOwner || cameFromCreate;

  useEffect(() => {
    const loadCourse = async () => {
      if (location.state?.courseData) {
        setCourseData({
          ...location.state.courseData,
          courseId: location.state.courseId || id,
          category: location.state.category || location.state.courseData.category,
          level: location.state.level || location.state.courseData.level,
          createdBy: location.state.courseData.createdBy || user?.email
        });
        setLoading(false);
        return;
      }
      if (id) {
        try {
          const course = await getCourseById(id);
          if (course) {
            setCourseData(course);
            // Check if content generated
            const chapters = await getChaptersByCourseId(id);
            setCoursePublished(chapters.length > 0);
          }
        } catch (error) {
          console.error("Error fetching course from DB:", error);
        }
      }
      setLoading(false);
    };
    loadCourse();
  }, [location.state, id]);

  const handleGenerateCourse = async () => {
    if (!courseData || !courseData.chapters) {
      alert("No chapters to generate content for!");
      return;
    }
    setGenerating(true);
    try {
      for (let i = 0; i < courseData.chapters.length; i++) {
        const chapter = courseData.chapters[i];
        setGeneratingChapter(i + 1);
        const content = await generateChapterContent(chapter, courseData);
        let videoId = "";

        // Only fetch video if not explicitly disabled
        // Only fetch video if not explicitly disabled
        if (courseData?.includeVideo !== "No") {
          const query = `${courseData.name} ${chapter.name || chapter.chapter_name}`;
          console.log("Searching video for:", query);
          const videos = await getVideos(query);
          console.log("Videos found:", videos);
          videoId = videos[0]?.id?.videoId || "";
          console.log("Selected Video ID:", videoId);
        }

        await saveChapterContentToDB(
          chapter.name || chapter.chapter_name || `Chapter ${i + 1}`,
          courseData.courseId,
          content,
          videoId
        );
      }
      setCoursePublished(true);
      navigate(`/course/${courseData.courseId}/finish`, { state: { courseData } });
    } catch (error) {
      console.error("Error generating course content:", error);
      alert("Failed to generate course content. Please try again.");
    } finally {
      setGenerating(false);
      setGeneratingChapter(0);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading course...</p>
      </div>
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
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Back button - only for owner */}
        {canEdit ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        ) : (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Shared Course</p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-8">Course Layout</h1>

        {/* Course Info Card - Two column layout with banner */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Course details */}
            <div className="flex-1">
              <div className="mb-4">
                {canEdit && editingTitle ? (
                  <input
                    type="text"
                    defaultValue={courseData.name || courseData.Name}
                    className="text-2xl font-bold text-foreground w-full border-b border-primary focus:outline-none bg-transparent"
                    onBlur={(e) => {
                      setCourseData({ ...courseData, name: e.target.value });
                      setEditingTitle(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {courseData.name || courseData.Name}
                    {canEdit && (
                      <button onClick={() => setEditingTitle(true)} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </h2>
                )}
              </div>

              {canEdit && editingDescription ? (
                <textarea
                  defaultValue={courseData.description || courseData.Description || "No description available."}
                  className="w-full text-sm text-muted-foreground border border-border rounded-lg p-2 focus:outline-none focus:border-primary min-h-[100px]"
                  onBlur={(e) => {
                    setCourseData({ ...courseData, description: e.target.value });
                    setEditingDescription(false);
                  }}
                  autoFocus
                />
              ) : (
                <p
                  className={`text-sm text-muted-foreground mb-6 p-2 rounded leading-relaxed ${canEdit ? "cursor-pointer hover:bg-secondary/50" : ""}`}
                  onClick={() => canEdit && setEditingDescription(true)}
                >
                  {courseData.description || courseData.Description || "No description available."}
                  {canEdit && <Edit className="h-3 w-3 inline ml-2 text-primary" />}
                </p>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <BookOpen className="h-3 w-3" />
                {courseData.category}
              </div>

        {/* Start button - only if content generated */}
        {coursePublished && (
          <button
            onClick={() => navigate(`/course/${courseData.courseId}/start`, { state: { courseData } })}
            className="w-full mt-4 px-12 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Learning
          </button>
        )}
            </div>

            {/* Right side - Banner image */}
            <div className="w-full md:w-80 h-52 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <img src={bannerImage} alt={courseData.name || "Course banner"} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
            <BarChart className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Skill Level</p>
            <p className="font-semibold text-sm">{courseData.level}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
            <Clock className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="font-semibold text-sm">{courseData.duration || courseData.Duration}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
            <BookOpen className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground mb-1">No Of Chapters</p>
            <p className="font-semibold text-sm">{courseData.chapters?.length || 0}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
            <Video className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Video Included?</p>
            <p className="font-semibold text-sm">{courseData.includeVideo || "Yes"}</p>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Chapters</h2>
          <div className="space-y-3">
            {(!courseData.chapters || courseData.chapters.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                <p>No chapters available yet.</p>
              </div>
            ) : (
              courseData.chapters.map((chapter: any, index: number) => (
                <div key={index} className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${generating && generatingChapter === index + 1
                      ? "bg-primary/20 text-primary animate-pulse"
                      : "bg-primary text-primary-foreground"
                      }`}>
                      {generating && generatingChapter === index + 1 ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                        {chapter.name || chapter.chapter_name || chapter.Name || `Chapter ${index + 1}`}
                        {canEdit && <Edit className="h-3 w-3 text-primary cursor-pointer" />}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {chapter.about || chapter.About || chapter.description || chapter.Description || "No description available"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {chapter.duration || chapter.Duration || "15 minutes"}
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generate Button - only if NOT generated */}
        {canEdit && !coursePublished && (
          <div className="flex items-center justify-start pb-12">
            <button
              onClick={handleGenerateCourse}
              disabled={generating || !courseData.chapters || courseData.chapters.length === 0}
              className="px-10 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Chapter {generatingChapter} of {courseData.chapters?.length}...
                </>
              ) : (
                "Generate Course Content"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLayoutPage;
