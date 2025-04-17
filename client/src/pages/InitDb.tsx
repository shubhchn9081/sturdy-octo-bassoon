import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

export default function InitDbPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: games = [] } = useQuery({
    queryKey: ['/api/games'],
    refetchOnWindowFocus: false,
  });

  const initializeGames = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/initialize-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
      console.error('Error initializing database:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Database Initialization</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Initialize Games</CardTitle>
              <CardDescription>
                Populate the database with game data from the frontend GAMES array
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">Current status:</p>
                  <p>{games.length > 0 ? `${games.length} games in database` : 'No games in database'}</p>
                </div>

                <Button 
                  onClick={initializeGames} 
                  disabled={isInitializing}
                  className="w-full"
                >
                  {isInitializing ? 'Initializing...' : 'Initialize Games'}
                </Button>

                {error && (
                  <div className="bg-destructive/20 p-4 rounded-md text-destructive">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}

                {result && (
                  <div className="bg-primary/20 p-4 rounded-md">
                    <p className="font-medium">Result:</p>
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>
                Go back to the main pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/admin">Go to Admin Panel</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}