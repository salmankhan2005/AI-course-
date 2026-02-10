import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, Code, Heart, Palette, Briefcase, Beaker, Music, PenTool, GraduationCap, PlayCircle, Youtube, Search } from "lucide-react";
import { getAllPublishedCourses, generateCourseLayout, saveCourseToDB } from "@/services/courseService";
import { getVideos } from "@/services/youtubeService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Category-based icon and gradient (reused)
const getCategoryStyle = (category: string) => {
  const styles: Record<string, { icon: any; gradient: string }> = {
    programming: { icon: Code, gradient: "from-violet-500 to-indigo-600" },
    health: { icon: Heart, gradient: "from-emerald-400 to-teal-600" },
    creative: { icon: Palette, gradient: "from-pink-500 to-rose-600" },
    business: { icon: Briefcase, gradient: "from-amber-400 to-orange-600" },
    science: { icon: Beaker, gradient: "from-cyan-400 to-blue-600" },
    music: { icon: Music, gradient: "from-fuchsia-500 to-purple-600" },
    design: { icon: PenTool, gradient: "from-teal-400 to-cyan-600" },
  };
  const key = category?.toLowerCase() || "";
  return styles[key] || { icon: GraduationCap, gradient: "from-primary to-primary/80" };
};

// Placeholder YouTube data (Default)
const DEFAULT_VIDEOS = [
  { id: 1, title: "Python for Beginners - Full Course", author: "Programming with Mosh", views: "35M", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg" },
  { id: 2, title: "Learn React in 30 Minutes", author: "Web Dev Simplified", views: "1.5M", thumbnail: "https://img.youtube.com/vi/hQAHSlTtcmY/maxresdefault.jpg" },
  { id: 3, title: "Introduction to Artificial Intelligence", author: "Simplilearn", views: "2.1M", thumbnail: "https://img.youtube.com/vi/ad79nYk2keg/maxresdefault.jpg" },
  { id: 4, title: "The Ultimate Guide to UI Design", author: "DesignCourse", views: "500K", thumbnail: "https://img.youtube.com/vi/pddG2X_E-1w/maxresdefault.jpg" },
  { id: 5, title: "Data Science Full Course 2024", author: "Edureka", views: "4.2M", thumbnail: "https://img.youtube.com/vi/-ETQ97mXXF0/maxresdefault.jpg" },
  { id: 6, title: "JavaScript Mastery Complete Course", author: "JS Mastery", views: "2.8M", thumbnail: "https://img.youtube.com/vi/lkIFF4maKMU/maxresdefault.jpg" },
  { id: 7, title: "Graphic Design Bootcamp", author: "Envato Tuts+", views: "1.2M", thumbnail: "https://img.youtube.com/vi/WONkq19S2f0/maxresdefault.jpg" },
  { id: 8, title: "Complete Digital Marketing Course", author: "Reliable Soft", views: "900K", thumbnail: "https://img.youtube.com/vi/nUrL10p7e3k/maxresdefault.jpg" },
  { id: 9, title: "AWS Certified Cloud Practitioner", author: "freeCodeCamp", views: "6.5M", thumbnail: "https://img.youtube.com/vi/3hLmDS179YE/maxresdefault.jpg" },
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<number | string | null>(null);

  // Video Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [videoResults, setVideoResults] = useState<any[]>(DEFAULT_VIDEOS);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCourses = await getAllPublishedCourses();
        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching explore courses:", error);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setVideoResults(DEFAULT_VIDEOS);
      return;
    }

    setSearching(true);
    try {
      // Append "course" or "tutorial" to ensure educational content
      const query = `${searchQuery} course tutorial`;
      const results = await getVideos(query, 12);

      const mappedResults = results.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        author: item.snippet.channelTitle,
        views: "YouTube", // API search doesn't return view count
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url
      }));

      setVideoResults(mappedResults);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleConvertVideo = async (video: any) => {
    if (convertingId) return;
    setConvertingId(video.id);

    try {
      // Use video title as the topic for generation
      const userInputs = {
        category: "Programming", // Defaulting to programming for these examples could be improved by inferring from video
        topic: video.title,
        description: `Generated from YouTube video: ${video.title} by ${video.author}`,
        level: "Beginner",
        duration: "1 hour",
        chapters: 5,
        addVideo: "Yes",
      };

      const result = await generateCourseLayout(userInputs);
      // @ts-ignore
      const id = await saveCourseToDB(result, user?.email || "", user?.displayName || "");

      navigate(`/course/${id}`, {
        state: {
          courseData: result,
          courseId: id,
          category: userInputs.category,
          level: userInputs.level
        }
      });
    } catch (error) {
      console.error("Error converting video to course:", error);
      alert("Failed to convert video to course. Please try again.");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover courses or convert YouTube videos into courses
        </p>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-8 p-1 bg-secondary/50 rounded-lg">
          <TabsTrigger value="courses" className="rounded-md px-6">Projects</TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-md px-6">Video Course</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const { icon: CategoryIcon, gradient } = getCategoryStyle(course.category);
                return (
                  <div
                    key={course.id}
                    className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-150 bg-card cursor-pointer group"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {/* Category gradient banner */}
                    <div className={`h-48 relative bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                      <CategoryIcon className="h-20 w-20 text-white/80 transform group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
                      <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
                      <div className="absolute bottom-6 left-6 h-10 w-10 rounded-full bg-white/10"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">{course.category}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-primary flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          {course.chapters} Chapters
                        </span>
                        <span className="text-sm text-muted-foreground">{course.level}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                          {course.author?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">{course.author}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="youtube">
          <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for a topic (e.g. Python, Yoga, Marketing)..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary/50 border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoResults.map((video) => (
                <div key={video.id} className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow group h-full flex flex-col">
                  <div className="h-48 relative overflow-hidden bg-black">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <Youtube className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-semibold text-foreground text-base leading-snug line-clamp-2 min-h-[44px] mb-2"
                      title={video.title}
                    >
                      {video.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="truncate max-w-[150px] font-medium">{video.author}</span>
                      <span className="bg-secondary px-2 py-0.5 rounded text-[10px]">{video.views}</span>
                    </div>

                    <div className="mt-auto">
                      <button
                        onClick={(e) => handleConvertVideo(video, e)}
                        disabled={convertingId === video.id || !!convertingId}
                        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {convertingId === video.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Convert to Course
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {videoResults.length === 0 && !searching && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No videos found. Try searching for a different topic.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExplorePage;
