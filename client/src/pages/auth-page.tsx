import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Lock, Mail, User, Dice5 } from "lucide-react";

const LoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthPage = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
    },
  });

  const onLoginSubmit = (data: z.infer<typeof LoginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof RegisterSchema>) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  useEffect(() => {
    // Reset form when switching tabs
    if (activeTab === "login") {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  }, [activeTab]);

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f1a24]">
      {/* Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1f3044] to-[#0f1a24] flex-col justify-center items-center p-10 text-white">
        <div className="max-w-md">
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-12 w-12 rounded-full bg-[#4cd964] flex items-center justify-center">
              <Dice5 className="h-6 w-6 text-[#0f1a24]" />
            </div>
            <h1 className="text-3xl font-bold">Stake.com</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Experience the Future of Casino Gaming</h2>
          <p className="text-lg opacity-90 mb-8">
            The world's leading crypto casino and sports betting platform. Provably fair games, 
            instant withdrawals, and industry-leading bonuses.
          </p>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-[#4cd964]">10+</div>
              <div className="text-sm text-gray-300">Original Games</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-[#4cd964]">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-[#4cd964]">Instant</div>
              <div className="text-sm text-gray-300">Withdrawals</div>
            </div>
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-[#4cd964]">99%</div>
              <div className="text-sm text-gray-300">RTP</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#4cd964]" />
            <span className="text-sm">Provably fair gaming experience</span>
          </div>
        </div>
      </div>

      {/* Auth form section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md bg-[#172B3A] border-[#253849] text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome to Stake.com</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details to {activeTab === "login" ? "sign in" : "create an account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-[#0e1822]">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#2a3642]">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#2a3642]">Register</TabsTrigger>
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
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="Enter your username" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
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
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-[#4cd964] hover:bg-[#40c557] text-black font-bold py-5"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                placeholder="Choose a username" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
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
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
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
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
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
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                className="pl-10 bg-[#0e1822] border-[#253849]" 
                                {...field} 
                              />
                            </div>
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
                              className="bg-[#0e1822] border-[#253849]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-[#4cd964] hover:bg-[#40c557] text-black font-bold py-5"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="mt-2 text-center text-sm text-gray-400">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;