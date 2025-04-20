import { ClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { dark } from '@clerk/themes';

// Clerk publishable key is loaded from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Make sure publishableKey is available
if (!publishableKey) {
  throw new Error('Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in environment variables.');
}

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#57FBA2',
          colorBackground: '#0F1923',
          colorText: '#FFFFFF',
          colorTextSecondary: '#94A3B8',
          colorInputBackground: '#172B3A',
          colorInputText: '#FFFFFF',
          colorShimmer: '#172B3A',
        },
        elements: {
          card: {
            backgroundColor: '#0F1923',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid #182634',
          },
          formButtonPrimary: {
            backgroundColor: '#57FBA2',
            color: '#0F1923',
            '&:hover': {
              backgroundColor: '#4ce996',
            },
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}