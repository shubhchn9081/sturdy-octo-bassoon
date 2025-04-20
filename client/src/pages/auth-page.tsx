import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  dateOfBirth: z.string().refine(val => {
    const date = new Date(val);
    const today = new Date();
    const age = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));
    return age >= 18;
  }, "You must be at least 18 years old"),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { login, register, isAuthenticated } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      dateOfBirth: "",
      phone: ""
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      // Use the login function from UserContext
      const success = await login(data.username, data.password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.username}!`,
        });
        
        // Redirect to homepage
        setLocation("/");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      // Use the register function from UserContext
      const success = await register(
        data.username, 
        data.password, 
        data.email, 
        data.dateOfBirth, 
        data.phone
      );
      
      if (success) {
        toast({
          title: "Registration successful",
          description: `Welcome, ${data.username}!`,
        });
        
        // Redirect to homepage
        setLocation("/");
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F212E] flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
        {/* Left side - Auth Forms */}
        <div className="w-full md:w-1/2 max-w-md">
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome to Stake.com</CardTitle>
              <CardDescription className="text-[#7F8990] text-center">
                Login or create an account to start playing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-white data-[state=active]:bg-[#1375e1]">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-white data-[state=active]:bg-[#1375e1]">
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-[#7F8990]">
                {activeTab === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <Button variant="link" className="text-[#1375e1] p-0" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Button variant="link" className="text-[#1375e1] p-0" onClick={() => setActiveTab("login")}>
                      Login
                    </Button>
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right side - Hero section */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-white">
          <div className="mb-6">
            <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-20" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-center">The Ultimate Casino Experience</h2>
          <ul className="space-y-4 mb-6">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-[#1375e1] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Provably fair games with instant results</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-[#1375e1] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Original casino games with high RTP</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-[#1375e1] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Daily bonuses and loyalty rewards</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-[#1375e1] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure and user-friendly platform</span>
            </li>
          </ul>
          <Button className="bg-[#1375e1] hover:bg-[#0e5dba]" onClick={() => setActiveTab("register")}>
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}