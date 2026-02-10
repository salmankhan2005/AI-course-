import { useNavigate } from "react-router-dom";
import { ChevronRight, LayoutGrid, Settings2, BookOpen, Headphones, Play, CheckCircle2, Wand2 } from "lucide-react";
import Logo from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: LayoutGrid,
      title: "Customizable Curriculum",
      description: "Tailor your learning journey with AI-driven customization.",
      detailedDescription: "Our AI analyzes your competitive landscape and target audience to generate a curriculum that fits perfectly. You can then tweak every chapter, add your own content, or let the AI refine it further to match your specific teaching style.",
    },
    {
      icon: Settings2,
      title: "Multimedia Content",
      description: "Generate video scripts, quizzes, and summaries instantly.",
      detailedDescription: "Transform text into engaging multimedia experiences. The platform automatically generates video scripts for each lesson, creates interactive quizzes to test knowledge, and provides concise summaries for quick review.",
    },
    {
      icon: BookOpen,
      title: "Free to Start",
      description: "Experiment with course creation without any upfront cost.",
      detailedDescription: "Start building your educational empire today. Our free tier allows you to generate complete course outlines and limited content, giving you a taste of the power of AI-driven education before you commit.",
    },
    {
      icon: Headphones,
      title: "Community Driven",
      description: "Join a thriving community of educators and creators.",
      detailedDescription: "You're not alone in your journey. Connect with other course creators, share your improved prompts, get feedback on your curriculum, and access a library of shared resources to accelerate your success.",
    },
  ];

  const howItWorks = [
    {
      icon: Wand2,
      title: "1. Choose Your Topic",
      description: "Select from a wide range of topics or define your own unique subject matter.",
    },
    {
      icon: Settings2,
      title: "2. Configure Settings",
      description: "Customize the difficulty level, duration, and specific requirements for your course.",
    },
    {
      icon: Play,
      title: "3. Generate Course",
      description: "Let our AI magic happen! Watch as your complete course structure and content is generated in seconds.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Logo />
        <div className="flex gap-4">
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hex-pattern py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background mb-8 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            AI Course Generator - Join Now
            <ChevronRight className="h-4 w-4" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            AI Course{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Generator
            </span>
          </h1>

          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Revolutionize your course creation with our AI-powered app, delivering engaging and high-quality courses in seconds.
          </p>

          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="gap-2 text-base px-8 h-12"
          >
            Get Started
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create your dream course in three simple steps. Our AI handles the heavy lifting so you can focus on teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            {howItWorks.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-background">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create world-class courses, built into one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Dialog key={index}>
                <div className="text-left p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors hover:bg-secondary/10 group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{feature.description}</p>

                  <DialogTrigger asChild>
                    <button className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Learn more <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <DialogTitle className="text-2xl">{feature.title}</DialogTitle>
                      <DialogDescription className="text-base pt-2">
                        {feature.detailedDescription}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Instant access</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>No credit card required</span>
                      </div>
                    </div>
                  </DialogContent>
                </div>
              </Dialog>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
