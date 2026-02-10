import { useState } from "react";
import { X } from "lucide-react";

interface EditCourseModalProps {
  title: string;
  description: string;
  label: string;
  onClose: () => void;
  onUpdate: (title: string, description: string) => void;
}

const EditCourseModal = ({
  title: initialTitle,
  description: initialDesc,
  label,
  onClose,
  onUpdate,
}: EditCourseModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDesc);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-lg w-full max-w-lg p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-5">{label}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={() => onUpdate(title, description)}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-dark transition-colors duration-150"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
