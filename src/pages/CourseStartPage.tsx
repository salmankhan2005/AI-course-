import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCourseById, getChaptersByCourseId } from "@/services/courseService";
import { ArrowLeft, PlayCircle, Copy, CheckCircle2, Loader2, Terminal, Play, BookOpen } from "lucide-react";
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "@/components/ui/button";

const CourseStartPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState<any>(null);
  const [videoId, setVideoId] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Playground state
  const [runningCode, setRunningCode] = useState<number | null>(null);
  const [codeOutput, setCodeOutput] = useState<Record<number, string>>({});

  // Load course and chapters from DB
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        // Get course data - try navigation state first, then DB
        let courseData = location.state?.courseData;
        if (!courseData) {
          courseData = await getCourseById(id);
        }

        if (courseData) {
          setCourse(courseData);

          // Load saved chapter content from DB
          const savedChapters = await getChaptersByCourseId(id);
          console.log("Saved chapters from DB:", savedChapters);
          setChapters(savedChapters);

          // Auto-select first chapter
          if (savedChapters.length > 0) {
            setChapterContent(savedChapters[0].content);
            setVideoId(savedChapters[0].videoId || "");
          }
        }
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state]);

  const handleChapterClick = (index: number) => {
    setSelectedChapterIndex(index);
    setRunningCode(null); // Reset running state
    setCodeOutput({});   // Reset output

    if (chapters[index]) {
      setChapterContent(chapters[index].content);
      setVideoId(chapters[index].videoId || "");
    } else {
      setChapterContent(null);
      setVideoId("");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = (index: number) => {
    setRunningCode(index);

    // Simulate execution
    setTimeout(() => {
      setRunningCode(null);
      setCodeOutput(prev => ({
        ...prev,
        [index]: "> Execution complete.\n> No errors found.\n> Program output will appear here in a real environment."
      }));
    }, 1500);
  };

  // Helper to parse content if it's a string or irregular structure
  const parseChapterContent = (content: any) => {
    if (!content) return [];

    // 1. Array check
    if (Array.isArray(content)) return content;

    // 2. Object with content array
    if (content.content && Array.isArray(content.content)) return content.content;

    // 3. String that is valid JSON
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
        if (parsed.content && Array.isArray(parsed.content)) return parsed.content;
      } catch (e) {
        // Not JSON
      }
    }

    // 4. Custom Format Parser (Fallback for "type: text, value: ..." format)
    if (typeof content === 'string' && (content.includes('type: text') || content.includes('type: code') || content.includes('type:code'))) {
      // Robust splitter considering loose format

      // Strategy: 
      // 1. Unescape \\n to \n globally first to handle literals? No, splitting might rely on them.
      // Let's split by "type:".

      const tokens = content.split(/(?=type:\s*(?:text|code))/i); // case insensitive for safety

      const finalItems = tokens.filter(t => t.trim().length > 0).map(token => {
        const lowerToken = token.toLowerCase();
        const isCode = lowerToken.includes('type: code');
        // Also check for "type:code" without space
        if (!isCode && !lowerToken.includes('type: text')) return null; // Garbage token

        const valueStart = token.toLowerCase().indexOf('value:');
        if (valueStart === -1) return null;

        let value = token.substring(valueStart + 6).trim();

        // Cleanup suffix
        let language = 'javascript';
        if (isCode) {
          const langIndex = token.toLowerCase().lastIndexOf('language:');
          if (langIndex !== -1) {
            // Extract language from original token (to preserve case if needed, though usually python/js is lowercase)
            // langIndex is from start of token.
            language = token.substring(langIndex + 9).trim().replace(/,$/, '');
            // Value ends before language
            // We need to cut value accurately. 
            // value substring started at valueStart + 6.
            // The generic length of value is (langIndex - (valueStart + 6))
            // But we must handle comma before language:
            let endIndex = langIndex - (valueStart + 6);
            value = value.substring(0, endIndex).trim();
          }
        }

        // Remove trailing comma from value if present
        if (value.endsWith(',')) value = value.slice(0, -1);

        // CRITICAL FIX: Unescape \\n literals to actual newlines for code blocks
        // Since the AI generated string likely has literal "\n" characters
        if (isCode) {
          value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        } else {
          // For text, we might want to keep control or not. 
          // The text renderer splits by \\n, so we keep \\n as is!
          // Wait, my text renderer uses `item.value.split('\\n')`.
          // So I should NOT unescape text value.
        }

        return {
          type: isCode ? 'code' : 'text',
          value: value,
          language: language
        };
      }).filter(item => item !== null);

      if (finalItems.length > 0) return finalItems;
    }

    // 5. Final Fallback
    const textContent = typeof content === 'string' ? content : JSON.stringify(content);
    return [{ type: 'text', value: textContent }];
  };

  const parsedContent = parseChapterContent(chapterContent);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Course not found</p>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const courseChapters = course.chapters || [];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => navigate(`/course/${id}`)}
            className="flex items-center gap-2 text-primary font-medium hover:underline mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
          <h2 className="font-bold text-lg text-foreground line-clamp-2">{course.name || course.Name}</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {courseChapters.map((chapter: any, index: number) => (
            <div
              key={index}
              onClick={() => handleChapterClick(index)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${selectedChapterIndex === index ? "bg-secondary" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selectedChapterIndex === index ? "bg-primary text-primary-foreground" :
                  chapters[index] ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                  {chapters[index] ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${selectedChapterIndex === index ? "text-primary" : "text-foreground"}`}>
                    {chapter.name || chapter.chapter_name || chapter.Name || `Chapter ${index + 1}`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    {chapter.duration || chapter.Duration || "15 min"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Video Player */}
          {videoId ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg mb-8 border border-border">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-8 border border-border dashed border-2">
              <div className="text-center">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground font-medium">No video available for this chapter</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none pb-20">
            <h1 className="text-3xl font-bold mb-6 text-foreground">
              {courseChapters[selectedChapterIndex]?.name ||
                courseChapters[selectedChapterIndex]?.chapter_name ||
                `Chapter ${selectedChapterIndex + 1}`}
            </h1>

            {!chapterContent ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4 font-medium">Generating content...</p>
                <p className="text-sm text-muted-foreground">If this takes too long, go back and try regenerating.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {parsedContent.map((item: any, index: number) => (
                  <div key={index}>
                    {/* Concept Card */}
                    {item.type === 'text' && (
                      <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        {/* Decorative accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>

                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 leading-relaxed text-foreground/90 text-base md:text-lg space-y-2">
                            {typeof item.value === 'string' ? item.value.split('\\n').map((line: string, i: number) => (
                              <p key={i} className="min-h-[1em]">{line}</p>
                            )) : item.value}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Code Playground */}
                    {item.type === 'code' && (
                      <div className="rounded-xl overflow-hidden border border-border shadow-xl my-8 bg-[#1e1e2e]">
                        {/* MacOS-style Toolbar */}
                        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#2b2d31]">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <span className="ml-4 text-xs font-mono text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                              <Terminal className="h-3 w-3" />
                              main.{item.language === 'python' ? 'py' : 'js'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyCode(item.value)}
                              className="text-muted-foreground hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                              title="Copy code"
                            >
                              {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </button>

                            <button
                              onClick={() => handleRunCode(index)}
                              disabled={runningCode === index}
                              className="flex items-center gap-1.5 px-3 py-1 bg-[#27c93f] hover:bg-[#27c93f]/90 text-black text-xs font-bold rounded-md transition-colors"
                            >
                              {runningCode === index ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3 fill-current" />
                              )}
                              Run
                            </button>
                          </div>
                        </div>

                        {/* Editor Area */}
                        <div className="relative">
                          <SyntaxHighlighter
                            language={item.language || "javascript"}
                            style={dracula}
                            customStyle={{
                              margin: 0,
                              padding: '1.5rem',
                              borderRadius: 0,
                              fontSize: '0.95rem',
                              lineHeight: '1.6',
                              background: 'transparent' // Use container bg
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                          >
                            {item.value}
                          </SyntaxHighlighter>
                        </div>

                        {/* Simulated Output Panel */}
                        {(runningCode === index || codeOutput[index]) && (
                          <div className="border-t border-white/10 bg-[#1e1e2e]">
                            <div className="px-4 py-2 bg-[#2b2d31] flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Output Terminal</span>
                            </div>
                            <div className="p-4 font-mono text-sm text-[#27c93f] min-h-[80px]">
                              {runningCode === index ? (
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-4 bg-[#27c93f] animate-pulse"></span>
                                  <span className="text-muted-foreground">Compiling...</span>
                                </div>
                              ) : (
                                <pre className="whitespace-pre-wrap font-mono">{codeOutput[index]}</pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStartPage;
