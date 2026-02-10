import { Link } from "react-router-dom";

const Logo = ({ size = "default" }: { size?: "default" | "small" }) => {
  const iconSize = size === "small" ? "h-8 w-8" : "h-9 w-9";

  return (
    <Link to="/" className="flex items-center gap-2">
      <div className={`${iconSize} rounded-lg bg-primary flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.8" />
          <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {size === "default" && (
        <span className="text-xl font-bold text-foreground">CourseAI</span>
      )}
    </Link>
  );
};

export default Logo;
