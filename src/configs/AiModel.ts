
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

// Using OpenAI compatibility for Groq as it often uses the same interface or similar
// However, the user specifically mentioned Groq API Key and Model.
// Usually Groq is accessed via `groq-sdk` or OpenAI compatible endpoint.
// Let's use a standard fetch for Groq to avoid extra dependencies if possible, or use the OpenAI SDK if installed.
// The user prompt didn't ask to install 'groq-sdk'. I will use direct fetch to https://api.groq.com/openai/v1/chat/completions

export const chatSession = async (prompt: string) => {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Groq API Error:", response.status, response.statusText, errorData);
            throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw error;
    }
}
