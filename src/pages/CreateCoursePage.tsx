import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";
import { generateCourseLayout, saveCourseToDB } from "@/services/courseService";
import { Loader2 } from "lucide-react";
import { LayoutGrid, MapPin, Settings, Code, Heart, Palette, ChevronLeft, Sparkles } from "lucide-react";
import { chatSession } from "@/configs/AiModel";
import Logo from "@/components/Logo";

const categories = [
  { id: "programming", label: "Programming", icon: "💻", emoji: "👨‍💻" },
  { id: "health", label: "Health", icon: "🧘", emoji: "🧘‍♀️" },
  { id: "creative", label: "Creative", icon: "🎨", emoji: "🎨" },
];

const steps = [
  { id: 1, label: "Category", icon: LayoutGrid },
  { id: 2, label: "Topic & Desc", icon: MapPin },
  { id: 3, label: "Options", icon: Settings },
];

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [addVideo, setAddVideo] = useState("");
  const [chapters, setChapters] = useState("");

  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [user] = useAuthState(auth);

  const handleGenerateDescription = async () => {
    if (!topic || topic.trim().length < 3) return;

    setGeneratingDesc(true);
    try {
      const prompt = `Generate a brief, engaging course description (max 50 words) for a course about: "${topic}". Focus on what the student will learn.`;
      const result = await chatSession(prompt);
      if (result) {
        setDescription(result.trim().replace(/^"|"$/g, ''));
      }
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const userInputs = {
        category: selectedCategory,
        topic,
        description,
        level: difficulty,
        duration,
        chapters,
        addVideo
      };

      // Generate Layout
      const result = await generateCourseLayout(userInputs);
      console.log("Generated course layout:", result);

      // Save to DB (background operation)
      // @ts-ignore
      const id = await saveCourseToDB(result, user?.email || "", user?.displayName || "", addVideo || "Yes");
      console.log("Saved course with ID:", id);

      setLoading(false);

      // Navigate with course data in state
      navigate(`/course/${id}`, {
        state: {
          courseData: result,
          courseId: id,
          category: selectedCategory,
          level: difficulty
        }
      });
    } catch (error) {
      console.error("Error generating course:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Logo size="small" />
        <div className="flex items-center gap-4">
          {/* User profile or other actions can go here */}
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-primary text-center mb-10">Create Course</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2 text-muted-foreground font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-32 h-0.5 mx-2 mb-6 ${currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-base font-medium text-foreground mb-6">Select the Course Category</h3>
            <div className="grid grid-cols-3 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-6 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer ${selectedCategory === cat.id
                    ? "border-primary bg-primary-light"
                    : "border-border bg-background hover:border-muted-foreground"
                    }`}
                >
                  <div className="text-4xl mb-3">{cat.emoji}</div>
                  <span className="font-medium text-sm text-foreground">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Topic & Description */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-foreground mb-2 block">
                💡 Write the topic for which you want to generate a course (e.g., Python Course, Yoga, etc.):
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-foreground block">
                  📝 Tell us more about your course, what you want to include in the course (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc || !topic || topic.length < 3}
                  className="text-xs flex items-center gap-1 text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Auto-generate description with AI"
                >
                  {generatingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Generate with AI
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="About your course"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
              />
            </div>
          </div>
        )}

        {/* Step 3: Options */}
        {currentStep === 3 && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-foreground mb-2 block">🎓 Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">⏱ Course Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">🎬 Add Video</label>
              <select
                value={addVideo}
                onChange={(e) => setAddVideo(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">📚 No of Chapters</label>
              <input
                type="number"
                value={chapters}
                onChange={(e) => setChapters(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate("/dashboard")}
            className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors duration-150"
          >
            Previous
          </button>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors duration-150"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors duration-150 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate Course Layout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
