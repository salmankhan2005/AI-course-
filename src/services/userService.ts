
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";

export const saveUserToDB = async (user: any) => {
    try {
        // Check if user exists
        const existingUser = await db
            .select()
            .from(Users)
            .where(eq(Users.email, user.email));

        if (existingUser.length === 0) {
            // Insert new user
            await db.insert(Users).values({
                name: user.displayName || "Anonymous",
                email: user.email,
                imageUrl: user.photoURL,
                password: user.password,
            });
            console.log("User saved to DB");
        } else {
            console.log("User already exists in DB");
        }
    } catch (error) {
        console.error("Error saving user to DB:", error);
    }
};
