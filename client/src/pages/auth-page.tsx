import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import NovitoLogo from "@/components/NovitoLogo";
import { Shield, Lock, CheckCircle, Award, Clock, Users, Globe, UserCheck } from "lucide-react";
import { SiVisa, SiMastercard, SiPaypal, SiBitcoin, SiEthereum } from "react-icons/si";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(6, "Phone number is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onLogin = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegister = (values: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      {/* Top Section with Logo and Stats */}
      <div className="bg-background/90 backdrop-blur-sm py-4 px-6 flex justify-between items-center border-b border-primary/20">
        <div className="relative">
          <NovitoLogo className="w-28 sm:w-32 text-3xl" />
          <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0"></div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span>
              <span className="font-medium">15K+</span> <span className="text-muted-foreground">Players</span>
            </span>
          </div>
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-primary" />
            <span>
              <span className="font-medium">150+</span> <span className="text-muted-foreground">Countries</span>
            </span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            <span>
              <span className="font-medium">100%</span> <span className="text-muted-foreground">Secure</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Auth Forms - Primary Focus */}
        <div className="flex-[2] flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm border-b border-primary/10 lg:border-b-0 lg:border-r">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to Novito</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your credentials to start your gaming journey
              </p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="text-sm font-medium">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-sm font-medium">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="border border-primary/20 shadow-xl shadow-primary/5">
                  <CardHeader className="space-y-1 py-4">
                    <CardTitle className="text-xl font-bold flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-primary" />
                      Login
                    </CardTitle>
                    <CardDescription>
                      Access your account securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="username" 
                                  className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                  {...field} 
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
                                  placeholder="••••••••" 
                                  className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="hover:opacity-90 active:opacity-95 transition-opacity">
                          <Button 
                            type="submit" 
                            className="w-full font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                    
                    {/* Trust Badges */}
                    <div className="mt-6">
                      <p className="text-xs text-center text-muted-foreground mb-2">Secured By</p>
                      <div className="flex justify-center space-x-3">
                        <div className="hover:-translate-y-1 transition-transform duration-200">
                          <Shield className="w-5 h-5 text-primary/90" />
                        </div>
                        <div className="hover:-translate-y-1 transition-transform duration-200">
                          <Lock className="w-5 h-5 text-primary/90" />
                        </div>
                        <div className="hover:-translate-y-1 transition-transform duration-200">
                          <CheckCircle className="w-5 h-5 text-primary/90" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="overflow-auto max-h-[70vh] lg:max-h-none border border-primary/20 shadow-xl shadow-primary/5">
                  <CardHeader className="space-y-1 py-4">
                    <CardTitle className="text-xl font-bold flex items-center">
                      <UserCheck className="w-5 h-5 mr-2 text-primary" />
                      Create an account
                    </CardTitle>
                    <CardDescription>
                      Join our trusted community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="username" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
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
                                    placeholder="your@email.com" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
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
                                <FormLabel>Phone (optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="tel" 
                                    placeholder="+1234567890" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
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
                                    placeholder="••••••••" 
                                    className="bg-background/5 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="hover:opacity-90 active:opacity-95 transition-opacity">
                          <Button 
                            type="submit" 
                            className="w-full font-semibold mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating account..." : "Register"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground text-center py-3 border-t border-primary/10">
                    By registering, you agree to our Terms of Service and Privacy Policy.
                    You must be at least 18 years old to create an account.
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-xs text-center text-muted-foreground mb-2">Trusted Payment Methods</p>
              <div className="flex justify-center space-x-4">
                <div className="hover:-translate-y-1 transition-transform duration-200 text-gray-400 hover:text-gray-300">
                  <SiVisa className="w-5 h-5" />
                </div>
                <div className="hover:-translate-y-1 transition-transform duration-200 text-gray-400 hover:text-gray-300">
                  <SiMastercard className="w-5 h-5" />
                </div>
                <div className="hover:-translate-y-1 transition-transform duration-200 text-gray-400 hover:text-gray-300">
                  <SiPaypal className="w-5 h-5" />
                </div>
                <div className="hover:-translate-y-1 transition-transform duration-200 text-gray-400 hover:text-gray-300">
                  <SiBitcoin className="w-5 h-5" />
                </div>
                <div className="hover:-translate-y-1 transition-transform duration-200 text-gray-400 hover:text-gray-300">
                  <SiEthereum className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info Section */}
        <div className="flex-1 bg-gradient-to-br from-primary/5 to-background p-4 lg:p-6 hidden lg:flex items-center">
          <div className="max-w-xl mx-auto px-2">            
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <Shield className="text-primary h-5 w-5 mr-2" />
                  <h3 className="font-medium text-sm">Provably Fair</h3>
                </div>
                <p className="text-xs text-muted-foreground">Verify game results with our transparent system</p>
              </div>
              
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <Award className="text-primary h-5 w-5 mr-2" />
                  <h3 className="font-medium text-sm">Crypto Support</h3>
                </div>
                <p className="text-xs text-muted-foreground">Play with multiple cryptocurrencies and tokens</p>
              </div>
              
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <Clock className="text-primary h-5 w-5 mr-2" />
                  <h3 className="font-medium text-sm">Fast Withdrawals</h3>
                </div>
                <p className="text-xs text-muted-foreground">Get your winnings instantly with zero delays</p>
              </div>
              
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <UserCheck className="text-primary h-5 w-5 mr-2" />
                  <h3 className="font-medium text-sm">24/7 Support</h3>
                </div>
                <p className="text-xs text-muted-foreground">Our team is always available to assist you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}