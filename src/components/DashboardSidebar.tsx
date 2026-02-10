import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/configs/firebase";
import { Home, Compass, BadgeCheck, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { useEffect, useState } from "react";
import { getUserCourses } from "@/services/courseService";

const FREE_COURSE_LIMIT = 5;

const menuItems = [
  { title: "Home", path: "/dashboard", icon: Home },
  { title: "Explore", path: "/explore", icon: Compass },
  { title: "Upgrade", path: "/upgrade", icon: BadgeCheck },
];

const DashboardSidebar = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (user?.email) {
        try {
          const courses = await getUserCourses(user.email);
          setCourseCount(courses.length);
        } catch (error) {
          console.error("Error fetching course count:", error);
        }
      }
    };
    fetchCount();
  }, [user, location.pathname]);

  const progressPercent = Math.min((courseCount / FREE_COURSE_LIMIT) * 100, 100);

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-background flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </RouterNavLink>
          );
        })}

        <button
          onClick={async () => {
            // @ts-ignore
            await auth.signOut();
            // @ts-ignore
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150 w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>

      {/* Progress */}
      <div className="p-6 cursor-pointer" onClick={() => navigate("/upgrade")}>
        <div className="w-full bg-secondary rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all duration-500 bg-primary"
            style={{ width: `${Math.min(courseCount * 10, 100)}%` }}
          />
        </div>
        <p className="text-sm font-medium text-foreground">
          {courseCount} Courses created
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Unlimited course generation
        </p>
      </div>

      {/* User Profile */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.displayName?.[0] || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{user?.displayName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

