import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCourseById, getChaptersByCourseId } from "@/services/courseService";
import { ArrowLeft, PlayCircle, Copy, CheckCircle2, Loader2, Terminal, Play, BookOpen } from "lucide-react";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';


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
  const [editableContent, setEditableContent] = useState<any[]>([]);
  const [codeTheme, setCodeTheme] = useState('dark');

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

  // Sync content to editable state
  useEffect(() => {
    if (chapterContent) {
      const parsed = parseContent(chapterContent);
      setEditableContent(parsed);
    } else {
      setEditableContent([]);
    }
  }, [chapterContent]);

  const parseContent = (content: any) => {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    const blocks: any[] = [];
    const lines = text.split('\n');
    let currentText = '';
    let currentCode = '';

    for (const line of lines) {
      const trimmed = line.trim();
      // Code: starts with code keywords or symbols, NOT regular sentences
      const isCode = trimmed && (
        /^(def |class |function |const |let |var |import |from |#include|public |private |if |for |while |return |print\(|console\.)/.test(trimmed) ||
        /^[{}()\[\];]/.test(trimmed) ||
        (currentCode && /^(\s+|\t)/.test(line) && trimmed) // indented continuation
      );

      if (isCode) {
        if (currentText.trim()) {
          blocks.push({ type: 'text', value: currentText.trim() });
          currentText = '';
        }
        currentCode += line + '\n';
      } else {
        if (currentCode.trim()) {
          blocks.push({ type: 'code', value: currentCode.trim(), language: 'python' });
          currentCode = '';
        }
        currentText += line + '\n';
      }
    }

    if (currentText.trim()) blocks.push({ type: 'text', value: currentText.trim() });
    if (currentCode.trim()) blocks.push({ type: 'code', value: currentCode.trim(), language: 'python' });

    return blocks.length ? blocks : [{ type: 'text', value: text }];
  };

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

    // Simulate execution of EDITED code
    const codeToRun = editableContent[index]?.value || "";
    setTimeout(() => {
      setRunningCode(null);
      setCodeOutput(prev => ({
        ...prev,
        [index]: `> Executing code (Length: ${codeToRun.length})...\n> Output:\n> Hello from the simulated environment!`
      }));
    }, 1500);
  };

  const handleCodeChange = (index: number, newCode: string) => {
    const newContent = [...editableContent];
    newContent[index] = { ...newContent[index], value: newCode };
    setEditableContent(newContent);
  };



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
          {/* Video Player - Only show if video is enabled for this course */}
          {/* Video Player - Only show if video is enabled AND available */}
          {course?.includeVideo?.toLowerCase() !== "no" && videoId && (
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
                {editableContent.map((item: any, index: number) => (
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
                          <div className="flex-1 leading-relaxed text-foreground/90 text-base md:text-lg">
                            <div className="markdown-content prose-p:my-2 prose-headings:text-foreground prose-headings:font-bold prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-pre:bg-[#1e1e2e] prose-pre:p-4 prose-pre:rounded-xl prose-pre:border prose-pre:border-border">
                              <ReactMarkdown>
                                {typeof item.value === 'string' ? item.value.replace(/\\n/g, '\n') : String(item.value)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Code Playground */}
                    {item.type === 'code' && (
                      <div className={`rounded-xl overflow-hidden border shadow-xl my-8 ${codeTheme === 'dark' ? 'bg-[#1e1e2e] border-border' : 'bg-white border-gray-300'}`}>
                        {/* MacOS-style Toolbar */}
                        <div className={`px-4 py-3 flex items-center justify-between border-b ${codeTheme === 'dark' ? 'border-white/10 bg-[#2b2d31]' : 'border-gray-200 bg-gray-100'}`}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <span className={`ml-4 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${codeTheme === 'dark' ? 'text-muted-foreground/60' : 'text-gray-500'}`}>
                              <Terminal className="h-3 w-3" />
                              main.{item.language === 'python' ? 'py' : 'js'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCodeTheme(codeTheme === 'dark' ? 'light' : 'dark')}
                              className={`p-1.5 rounded-md transition-colors ${codeTheme === 'dark' ? 'text-muted-foreground hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
                              title="Toggle theme"
                            >
                              {codeTheme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <button
                              onClick={() => handleCopyCode(item.value)}
                              className={`p-1.5 rounded-md transition-colors ${codeTheme === 'dark' ? 'text-muted-foreground hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
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
                        <div className="relative font-mono text-sm">
                          <Editor
                            value={item.value}
                            onValueChange={(code) => handleCodeChange(index, code)}
                            highlight={(code) => highlight(code, item.language === 'python' ? languages.python : languages.js || languages.javascript, item.language || 'javascript')}
                            padding={20}
                            style={{
                              fontFamily: '"Fira code", "Fira Mono", monospace',
                              fontSize: 14,
                              backgroundColor: 'transparent',
                              minHeight: '100px',
                              lineHeight: '1.5',
                              color: codeTheme === 'dark' ? '#f8f8f2' : '#24292e'
                            }}
                            textareaClassName="focus:outline-none"
                          />
                        </div>

                        {/* Simulated Output Panel */}
                        {(runningCode === index || codeOutput[index]) && (
                          <div className={`border-t ${codeTheme === 'dark' ? 'border-white/10 bg-[#1e1e2e]' : 'border-gray-200 bg-gray-50'}`}>
                            <div className={`px-4 py-2 flex items-center justify-between ${codeTheme === 'dark' ? 'bg-[#2b2d31]' : 'bg-gray-100'}`}>
                              <span className={`text-[10px] uppercase font-bold tracking-widest ${codeTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}`}>Output Terminal</span>
                            </div>
                            <div className={`p-4 font-mono text-sm min-h-[80px] ${codeTheme === 'dark' ? 'text-[#27c93f]' : 'text-green-700'}`}>
                              {runningCode === index ? (
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-4 animate-pulse ${codeTheme === 'dark' ? 'bg-[#27c93f]' : 'bg-green-600'}`}></span>
                                  <span className={codeTheme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'}>Compiling...</span>
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
