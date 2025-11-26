import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { Lock, Mail, Loader2 } from "lucide-react";
import api from "@/lib/api"; // Connects to your Python Backend

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  // State for Sign In
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // State for Sign Up
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", signInEmail);
      formData.append("password", signInPassword);

      // FIX: We must override the header to allow Form Data
      const response = await api.post("/token", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      
      // Improved Error Handling: checks if the error is an object or string
      const detail = error.response?.data?.detail;
      const errorMessage = typeof detail === "object" 
        ? JSON.stringify(detail) 
        : detail || "Check your credentials";

      alert("Login Failed: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Register the user
      await api.post("/register", {
        email: signUpEmail,
        password: signUpPassword
      });
      
      alert("Account created successfully! Please Sign In.");
      setActiveTab("signin"); // Switch to sign in tab
      setSignInEmail(signUpEmail); // Pre-fill email
      setSignUpEmail("");
      setSignUpPassword("");
    } catch (error: any) {
      console.error(error);
      alert("Registration Failed: " + (error.response?.data?.detail || "Try a different email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to Ocean AI</CardTitle>
            <CardDescription>
              Secure access to your AI-powered workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              {/* --- SIGN IN FORM --- */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signin-email" 
                        type="email" 
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signin-password" 
                        type="password"
                        className="pl-10"
                        placeholder="••••••••"
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In Securely"}
                  </Button>
                </form>
              </TabsContent>
              
              {/* --- SIGN UP FORM --- */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password"
                        className="pl-10"
                        placeholder="••••••••"
                        minLength={8}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;