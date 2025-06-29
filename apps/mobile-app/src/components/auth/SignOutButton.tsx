import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { Button } from 'tamagui';

export function SignOutButton() {
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Let Clerk handle all navigation automatically
      // No manual navigation needed
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      theme="red"
      size="$4"
      onPress={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
} 