import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../../hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Facebook, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Social login icons
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const TwitchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#9146FF">
    <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z" fillRule="evenodd" clipRule="evenodd"/>
  </svg>
);

// Types and schemas
const loginSchema = z.object({
  username: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration has multiple steps, so we'll define schemas for each step
const languageSchema = z.object({
  language: z.string().min(1, "Please select a language"),
});

type LanguageFormValues = z.infer<typeof languageSchema>;

export type AuthModalType = 'login' | 'register' | null;

type AuthModalsProps = {
  open: AuthModalType;
  onOpenChange: (open: AuthModalType) => void;
};

// Available languages
const languages = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Español' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'German', label: 'Deutsch' },
  { value: 'French', label: 'Français' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Chinese', label: 'Chinese' },
];

const AuthModals: React.FC<AuthModalsProps> = ({ open, onOpenChange }) => {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [language, setLanguage] = useState('English');

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Language form setup
  const languageForm = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      language: 'English',
    },
  });

  // Handle login form submission
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
    if (!loginMutation.isError) {
      onOpenChange(null);
    }
  }

  // Handle language selection (step 1 of registration)
  function onLanguageSubmit(values: LanguageFormValues) {
    setLanguage(values.language);
    setRegistrationStep(2);
  }

  // Handle dialog close
  const handleClose = () => {
    // Reset form states
    loginForm.reset();
    languageForm.reset();
    setRegistrationStep(1);
    onOpenChange(null);
  };

  // Switch between login and register
  const switchToLogin = () => {
    setRegistrationStep(1);
    onOpenChange('login');
  };

  const switchToRegister = () => {
    setRegistrationStep(1);
    onOpenChange('register');
  };

  return (
    <>
      {/* Login Modal */}
      <Dialog open={open === 'login'} onOpenChange={(open) => onOpenChange(open ? 'login' : null)}>
        <DialogContent className="sm:max-w-md bg-[#142634] text-white border-[#243442]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-center w-full text-xl">
              <div className="flex justify-center mb-2">
                <svg width="50" height="50" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M108.055 47.803L69.8945 16.8076C65.8242 13.5156 59.1758 13.5156 55.1055 16.8076L16.9453 47.803C12.875 51.0949 12.875 56.5635 16.9453 59.8555L55.1055 90.851C59.1758 94.1429 65.8242 94.1429 69.8945 90.851L108.055 59.8555C112.125 56.5635 112.125 51.0949 108.055 47.803Z" stroke="white" strokeWidth="4"/>
                  <path d="M62.5003 63.3789C62.5003 69.0747 58.7864 69.6444 53.6635 69.3013C53.5479 69.2938 53.4313 69.2927 53.3146 69.2927H47.4263C47.1931 69.2927 46.9644 69.2406 46.756 69.1401C46.5476 69.0396 46.3651 68.8933 46.2212 68.7115C46.0774 68.5297 45.9761 68.3169 45.9248 68.0887C45.8735 67.8605 45.8735 67.6232 45.925 67.395L49.6699 52.2974C49.7223 52.0671 49.8255 51.8522 49.9719 51.6692C50.1184 51.4861 50.3044 51.3396 50.5163 51.2399C50.7282 51.1403 50.9604 51.0898 51.1963 51.0923C51.4322 51.0947 51.6633 51.15 51.8729 51.2543L57.5934 54.1147C59.9055 55.2745 62.5003 56.3267 62.5003 59.6936V63.3789Z" fill="white"/>
                  <path d="M62.5003 75.0463C62.5003 69.3505 58.7864 68.7809 53.6635 69.124C53.5479 69.1314 53.4313 69.1325 53.3146 69.1325H47.4263C47.1931 69.1325 46.9644 69.1847 46.756 69.2852C46.5476 69.3857 46.3651 69.532 46.2212 69.7138C46.0774 69.8956 45.9761 70.1084 45.9248 70.3366C45.8735 70.5647 45.8735 70.8021 45.925 71.0303L49.6699 86.1279C49.7223 86.3582 49.8255 86.5731 49.9719 86.7561C50.1184 86.9391 50.3044 87.0856 50.5163 87.1853C50.7282 87.285 50.9604 87.3354 51.1963 87.333C51.4322 87.3306 51.6633 87.2753 51.8729 87.171L57.5934 84.3105C59.9055 83.1507 62.5003 82.0986 62.5003 78.7316V75.0463Z" fill="white"/>
                  <path d="M82.6841 69.2938H76.6848C76.5681 69.2938 76.4515 69.2949 76.3359 69.3024C71.213 69.6455 67.4992 69.0758 67.4992 63.38V59.6947C67.4992 56.3278 70.0939 55.2756 72.406 54.1158L78.1266 51.2554C78.3361 51.1511 78.5672 51.0958 78.8032 51.0934C79.0391 51.0909 79.2713 51.1414 79.4832 51.2411C79.695 51.3407 79.881 51.4872 80.0275 51.6703C80.174 51.8533 80.2771 52.0682 80.3295 52.2985L84.0745 67.3961C84.1259 67.6243 84.1259 67.8617 84.0746 68.0898C84.0233 68.318 83.922 68.5308 83.7782 68.7126C83.6343 68.8944 83.4518 69.0407 83.2434 69.1412C83.035 69.2417 82.8063 69.2938 82.5731 69.2938H82.6841Z" fill="white"/>
                </svg>
              </div>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-[#243442]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-300">Email or Username *</Label>
              <Input
                id="username"
                className="bg-[#0B1A25] border-[#243442] focus:border-[#3498db] text-white"
                {...loginForm.register('username')}
              />
              {loginForm.formState.errors.username && (
                <p className="text-[#ff4757] text-xs">{loginForm.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm text-gray-300">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="bg-[#0B1A25] border-[#243442] focus:border-[#3498db] text-white pr-10"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-[#ff4757] text-xs">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#243442]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#142634] text-gray-400">OR</span>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="bg-transparent border-[#243442] hover:bg-[#243442] text-white"
              >
                <Facebook className="h-4 w-4 text-[#3b5998]" />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="bg-transparent border-[#243442] hover:bg-[#243442] text-white"
              >
                <GoogleIcon />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="bg-transparent border-[#243442] hover:bg-[#243442] text-white"
              >
                <TwitchIcon />
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400 pt-4">
              <Button 
                type="button"
                variant="link" 
                className="text-[#3498db] hover:text-[#2980b9] hover:underline p-0"
              >
                Forgot Password
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Button 
                type="button"
                variant="link" 
                className="text-[#3498db] hover:text-[#2980b9] hover:underline p-0"
                onClick={switchToRegister}
              >
                Register an Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={open === 'register'} onOpenChange={(open) => onOpenChange(open ? 'register' : null)}>
        <DialogContent className="sm:max-w-md bg-[#142634] text-white border-[#243442]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-center w-full text-xl">
              <div className="flex justify-center mb-2">
                <svg width="50" height="50" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M108.055 47.803L69.8945 16.8076C65.8242 13.5156 59.1758 13.5156 55.1055 16.8076L16.9453 47.803C12.875 51.0949 12.875 56.5635 16.9453 59.8555L55.1055 90.851C59.1758 94.1429 65.8242 94.1429 69.8945 90.851L108.055 59.8555C112.125 56.5635 112.125 51.0949 108.055 47.803Z" stroke="white" strokeWidth="4"/>
                  <path d="M62.5003 63.3789C62.5003 69.0747 58.7864 69.6444 53.6635 69.3013C53.5479 69.2938 53.4313 69.2927 53.3146 69.2927H47.4263C47.1931 69.2927 46.9644 69.2406 46.756 69.1401C46.5476 69.0396 46.3651 68.8933 46.2212 68.7115C46.0774 68.5297 45.9761 68.3169 45.9248 68.0887C45.8735 67.8605 45.8735 67.6232 45.925 67.395L49.6699 52.2974C49.7223 52.0671 49.8255 51.8522 49.9719 51.6692C50.1184 51.4861 50.3044 51.3396 50.5163 51.2399C50.7282 51.1403 50.9604 51.0898 51.1963 51.0923C51.4322 51.0947 51.6633 51.15 51.8729 51.2543L57.5934 54.1147C59.9055 55.2745 62.5003 56.3267 62.5003 59.6936V63.3789Z" fill="white"/>
                  <path d="M62.5003 75.0463C62.5003 69.3505 58.7864 68.7809 53.6635 69.124C53.5479 69.1314 53.4313 69.1325 53.3146 69.1325H47.4263C47.1931 69.1325 46.9644 69.1847 46.756 69.2852C46.5476 69.3857 46.3651 69.532 46.2212 69.7138C46.0774 69.8956 45.9761 70.1084 45.9248 70.3366C45.8735 70.5647 45.8735 70.8021 45.925 71.0303L49.6699 86.1279C49.7223 86.3582 49.8255 86.5731 49.9719 86.7561C50.1184 86.9391 50.3044 87.0856 50.5163 87.1853C50.7282 87.285 50.9604 87.3354 51.1963 87.333C51.4322 87.3306 51.6633 87.2753 51.8729 87.171L57.5934 84.3105C59.9055 83.1507 62.5003 82.0986 62.5003 78.7316V75.0463Z" fill="white"/>
                  <path d="M82.6841 69.2938H76.6848C76.5681 69.2938 76.4515 69.2949 76.3359 69.3024C71.213 69.6455 67.4992 69.0758 67.4992 63.38V59.6947C67.4992 56.3278 70.0939 55.2756 72.406 54.1158L78.1266 51.2554C78.3361 51.1511 78.5672 51.0958 78.8032 51.0934C79.0391 51.0909 79.2713 51.1414 79.4832 51.2411C79.695 51.3407 79.881 51.4872 80.0275 51.6703C80.174 51.8533 80.2771 52.0682 80.3295 52.2985L84.0745 67.3961C84.1259 67.6243 84.1259 67.8617 84.0746 68.0898C84.0233 68.318 83.922 68.5308 83.7782 68.7126C83.6343 68.8944 83.4518 69.0407 83.2434 69.1412C83.035 69.2417 82.8063 69.2938 82.5731 69.2938H82.6841Z" fill="white"/>
                </svg>
              </div>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-[#243442]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {registrationStep === 1 && (
            <>
              <div className="mb-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-white">
                        Step 1 / 3
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#0B1A25]">
                    <div style={{ width: "33%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#3498db]"></div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Select Your Preferred Language</h2>
                <p className="text-gray-400 text-sm">
                  Stake is available is several languages. Feel free to personalise your language across our site from the options below.
                </p>
              </div>

              <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Select 
                    defaultValue={languageForm.getValues().language}
                    onValueChange={(value) => languageForm.setValue('language', value)}
                  >
                    <SelectTrigger className="bg-[#0B1A25] border-[#243442] focus:border-[#3498db] text-white">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1A25] border-[#243442] text-white">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="hover:bg-[#243442] focus:bg-[#243442]">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#3498db] hover:bg-[#2980b9] text-white"
                >
                  Confirm
                </Button>

                <div className="text-center text-sm text-gray-400 pt-2">
                  Already have an account?{' '}
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-[#3498db] hover:text-[#2980b9] hover:underline p-0"
                    onClick={switchToLogin}
                  >
                    Sign in
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthModals;