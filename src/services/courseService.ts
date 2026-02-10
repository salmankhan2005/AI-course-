
import { chatSession } from "@/configs/AiModel";
import { db } from "@/configs/db";
import { CourseList, Chapters } from "@/configs/schema";
import uuid4 from "uuid4";
import { eq } from "drizzle-orm";

export const generateCourseLayout = async (userInputs: any) => {
    const { category, topic, level, duration, chapters, addVideo, description } = userInputs;

    const prompt = `Generate a detailed course tutorial based on the following inputs. Return ONLY valid JSON without any markdown formatting.

Category: '${category}'
Topic: '${topic}'
Level: '${level}'
Duration: '${duration}'
Number of Chapters: ${chapters}
Additional Description: '${description}'
Include Video: '${addVideo}'

The JSON must follow this EXACT structure:
{
  "name": "Course Title",
  "description": "Course description",
  "category": "${category}",
  "level": "${level}",
  "duration": "${duration}",
  "chapters": [
    {
      "name": "Chapter 1 Title",
      "about": "Brief description of what this chapter covers",
      "duration": "15 minutes"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations.`;

    try {
        let result = await chatSession(prompt);
        // Remove markdown code block syntax if present
        if (result) {
            result = result.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(result || "{}");
        console.log("Parsed course layout:", parsed);
        return parsed;
    } catch (error) {
        console.error("Error generating course layout:", error);
        throw error;
    }
};

export const saveCourseToDB = async (courseData: any, userEmail: string, userName?: string, includeVideo: string = "Yes") => {
    const id = uuid4();
    try {
        await db.insert(CourseList).values({
            courseId: id,
            name: courseData?.name || "Untitled Course",
            category: courseData?.category || "General",
            level: courseData?.level || "Beginner",
            courseOutput: JSON.stringify(courseData),
            createdBy: userEmail,
            userName: userName || userEmail?.split('@')[0] || "User",
            userProfileImage: "",
            includeVideo: includeVideo,
        });
        return id;
    } catch (error) {
        console.error("Error saving to DB", error);
        throw error;
    }
}

export const generateChapterContent = async (chapter: any, course: any) => {
    const chapterName = chapter.name || chapter.chapter_name || chapter.Name || 'Chapter';
    const courseName = course.name || course.Name || 'Course';

    const prompt = `Write educational content for "${chapterName}" from "${courseName}".

Write like a textbook with explanations and code examples.
Include 2-3 code examples.
Do NOT use JSON, markdown, or any formatting.
Just write naturally.

Example:
Python is a programming language. It is easy to learn.

print("Hello World")
x = 5

Variables store data. You can use them in your code.`;

    try {
        const result = await chatSession(prompt);
        return result || "Content generation failed.";
    } catch (error) {
        console.error("Error generating chapter content:", error);
        return "Content generation error. Please regenerate.";
    }
}


export const saveChapterContentToDB = async (chapterId: string, courseId: string, content: any, videoId: string) => {
    try {
        await db.insert(Chapters).values({
            chapterId: chapterId,
            courseId: courseId,
            content: JSON.stringify(content),
            videoId: videoId
        });
    } catch (error) {
        console.error("Error saving chapter to DB:", error);
        throw error;
    }
}

export const deleteCourse = async (courseId: string) => {
    try {
        // Delete chapters first
        await db.delete(Chapters).where(eq(Chapters.courseId, courseId));
        // Then delete the course
        await db.delete(CourseList).where(eq(CourseList.courseId, courseId));
    } catch (error) {
        console.error("Error deleting course:", error);
        throw error;
    }
}

export const getCourseById = async (courseId: string) => {
    try {
        const result = await db.select().from(CourseList).where(eq(CourseList.courseId, courseId));
        if (result.length === 0) return null;

        const course = result[0];
        const courseOutput = JSON.parse(course.courseOutput);
        return {
            ...courseOutput,
            courseId: course.courseId,
            category: course.category,
            level: course.level,
            includeVideo: course.includeVideo,
            createdBy: course.createdBy,
            courseBanner: course.courseBanner,
        };
    } catch (error) {
        console.error("Error fetching course by ID:", error);
        throw error;
    }
}

export const getUserCourses = async (userEmail: string) => {
    try {
        const result = await db.select().from(CourseList).where(eq(CourseList.createdBy, userEmail));
        return result.map((course) => {
            const courseOutput = JSON.parse(course.courseOutput);
            return {
                id: course.courseId,
                title: courseOutput.name || course.name,
                category: course.category,
                chapters: courseOutput.chapters?.length || 0,
                level: course.level,
                image: course.courseBanner || '/placeholder.png',
                description: courseOutput.description || '',
            };
        });
    } catch (error) {
        console.error("Error fetching user courses:", error);
        return [];
    }
}

export const getAllPublishedCourses = async () => {
    try {
        const result = await db.select().from(CourseList);
        return result.map((course) => {
            const courseOutput = JSON.parse(course.courseOutput);
            return {
                id: course.courseId,
                title: courseOutput.name || course.name,
                category: course.category,
                chapters: courseOutput.chapters?.length || 0,
                level: course.level,
                image: course.courseBanner || '/placeholder.png',
                author: course.userName || 'Unknown',
                description: courseOutput.description || '',
            };
        });
    } catch (error) {
        console.error("Error fetching published courses:", error);
        return [];
    }
}

export const getChaptersByCourseId = async (courseId: string) => {
    try {
        const result = await db.select().from(Chapters).where(eq(Chapters.courseId, courseId));
        return result.map((ch) => ({
            chapterId: ch.chapterId,
            content: JSON.parse(ch.content),
            videoId: ch.videoId
        }));
    } catch (error) {
        console.error("Error fetching chapters:", error);
        return [];
    }
}


