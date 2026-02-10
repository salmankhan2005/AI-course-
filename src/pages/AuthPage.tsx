
import { auth, googlePdf } from "@/configs/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { saveUserToDB } from "@/services/userService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
    const navigate = useNavigate();
    const [method, setMethod] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googlePdf);
            const user = result.user;
            await saveUserToDB(user);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (method === 'signup') {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                const user = result.user;

                await updateProfile(user, {
                    displayName: fullName
                });

                // Refresh user object to get updated profile
                await user.reload();
                const updatedUser = auth.currentUser;

                if (updatedUser) {
                    await saveUserToDB({
                        ...updatedUser,
                        displayName: fullName, // Ensure this is passed correctly
                        password: password // Save password to DB
                    });
                }

                navigate("/dashboard");
            } else {
                const result = await signInWithEmailAndPassword(auth, email, password);
                const user = result.user;
                // No need to save user on sign in if they already exist, but good check
                await saveUserToDB(user);
                navigate("/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="p-8 bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {method === 'signin' ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground">
                        {method === 'signin'
                            ? "Sign in to continue to your dashboard"
                            : "Enter your details to get started"}
                    </p>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    {method === 'signup' && (
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {method === 'signin' ? "Sign In" : "Sign Up"}
                    </Button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full gap-2 mb-6"
                    disabled={loading}
                >
                    <FcGoogle className="h-5 w-5" />
                    Google
                </Button>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        {method === 'signin' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setMethod(method === 'signin' ? 'signup' : 'signin')}
                            className="text-primary hover:underline font-medium"
                        >
                            {method === 'signin' ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
