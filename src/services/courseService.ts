
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

export const saveCourseToDB = async (courseData: any, userEmail: string, userName?: string) => {
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
            includeVideo: "Yes",
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

    const prompt = `Generate educational content for the chapter "${chapterName}" from the course "${courseName}".

Return ONLY a valid JSON object with this structure:
{
  "title": "${chapterName}",
  "content": [
    {"type": "text", "value": "explanation paragraph here"},
    {"type": "code", "value": "code example here", "language": "python"}
  ]
}

Rules:
- Return ONLY the raw JSON object. Do not wrap it in markdown code blocks or any other text.
- Do not use "type: value" strings. Use valid JSON.
- Use \\n for newlines inside string values, NOT actual newlines.
- Escape all double quotes inside strings with backslash.
- Include 3-5 text sections with code examples.
- Keep code examples short (under 10 lines each).`;

    try {
        let result = await chatSession(prompt);
        if (!result) return { title: chapterName, content: [{ type: "text", value: "Content generation failed." }] };

        // Clean up the response
        result = result.replace(/```json/g, '').replace(/```/g, '').trim();

        // Try to extract JSON object if there's extra text around it
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            result = jsonMatch[0];
        }

        // Replace control characters
        // eslint-disable-next-line no-control-regex
        result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Replace actual newlines/tabs inside strings with escaped versions
        result = result.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

        // Fix double-escaped sequences
        result = result.replace(/\\\\n/g, '\\n').replace(/\\\\t/g, '\\t').replace(/\\\\r/g, '\\r');

        console.log("Cleaned chapter content (first 200 chars):", result.substring(0, 200));

        try {
            return JSON.parse(result);
        } catch (parseError) {
            console.warn("First parse failed, attempting repair...", parseError);

            // Attempt to fix common JSON issues
            // Fix unescaped quotes inside values by finding the pattern
            // Try a simpler approach: just return structured content from the raw text
            return {
                title: chapterName,
                content: [
                    { type: "text", value: result.substring(0, 2000).replace(/[{}[\]"]/g, '').trim() || "Content was generated but could not be parsed." }
                ]
            };
        }
    } catch (error) {
        console.error("Error generating chapter content:", error);
        // Return fallback content instead of throwing
        return {
            title: chapterName,
            content: [
                { type: "text", value: "Content generation encountered an error. Please try again." }
            ]
        };
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


