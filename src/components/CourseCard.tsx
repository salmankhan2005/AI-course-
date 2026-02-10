import { useNavigate } from "react-router-dom";
import { BookOpen, Trash2, AlertTriangle, X, Code, Heart, Palette, Briefcase, Beaker, Music, PenTool, GraduationCap } from "lucide-react";
import { deleteCourse } from "@/services/courseService";
import { useState } from "react";

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  chapters: number;
  level: string;
  image?: string;
  onDelete?: (id: string) => void;
}

// Category-based icon and gradient config
const getCategoryStyle = (category: string) => {
  const styles: Record<string, { icon: any; gradient: string; iconColor: string }> = {
    programming: { icon: Code, gradient: "from-violet-500 to-indigo-600", iconColor: "text-white/80" },
    health: { icon: Heart, gradient: "from-emerald-400 to-teal-600", iconColor: "text-white/80" },
    creative: { icon: Palette, gradient: "from-pink-500 to-rose-600", iconColor: "text-white/80" },
    business: { icon: Briefcase, gradient: "from-amber-400 to-orange-600", iconColor: "text-white/80" },
    science: { icon: Beaker, gradient: "from-cyan-400 to-blue-600", iconColor: "text-white/80" },
    music: { icon: Music, gradient: "from-fuchsia-500 to-purple-600", iconColor: "text-white/80" },
    design: { icon: PenTool, gradient: "from-teal-400 to-cyan-600", iconColor: "text-white/80" },
  };

  const key = category?.toLowerCase() || "";
  return styles[key] || { icon: GraduationCap, gradient: "from-primary to-primary/80", iconColor: "text-white/80" };
};

const CourseCard = ({ id, title, category, chapters, level, image, onDelete }: CourseCardProps) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { icon: CategoryIcon, gradient, iconColor } = getCategoryStyle(category);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setShowDialog(false);
    try {
      await deleteCourse(id);
      onDelete?.(id);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-150 bg-card relative group ${deleting ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => navigate(`/course/${id}`)}
      >
        {/* Course Banner - Gradient with Icon */}
        <div className={`h-48 relative bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <CategoryIcon className={`h-20 w-20 ${iconColor}`} strokeWidth={1} />
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-6 left-6 h-10 w-10 rounded-full bg-white/10"></div>
          <div className="absolute top-12 left-10 h-6 w-6 rounded-full bg-white/5"></div>

          {/* Delete button overlay */}
          <button
            onClick={handleDeleteClick}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-md z-10"
            title="Delete course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground text-base leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{category}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-primary flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {chapters} Chapters
            </span>
            <span className="text-sm text-muted-foreground">{level}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowDialog(false); }}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">Delete Course</h3>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{title}"</span>? This action cannot be undone and all course content will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;
