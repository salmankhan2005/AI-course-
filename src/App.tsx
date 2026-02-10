import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CourseLayoutPage from "./pages/CourseLayoutPage";
import CourseFinishPage from "./pages/CourseFinishPage";
import CourseStartPage from "./pages/CourseStartPage";
import ExplorePage from "./pages/ExplorePage";
import UpgradePage from "./pages/UpgradePage";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
          </Route>
          <Route path="/create-course" element={<CreateCoursePage />} />
          <Route path="/course/:id" element={<CourseLayoutPage />} />
          <Route path="/course/:id/finish" element={<CourseFinishPage />} />
          <Route path="/course/:id/start" element={<CourseStartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
