import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

type Game = {
  id: number;
  name: string;
  slug: string;
  type: string;
  activePlayers: number;
  rtp: number;
  maxMultiplier: number;
  minBet: number;
  maxBet: number;
  imageUrl?: string | null;
};

export default function AdminPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch games
  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    refetchOnWindowFocus: false,
  });

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/games/${selectedGame?.id}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Image updated successfully",
        description: `Image for ${selectedGame?.name} has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating image",
        description: "There was an error updating the image. Please try again.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    }
  });

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame) {
      toast({
        title: "No game selected",
        description: "Please select a game before uploading an image",
        variant: "destructive",
      });
      return;
    }
    
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    uploadMutation.mutate(formData);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Games
        </Button>
      </div>

      <Tabs defaultValue="game-images">
        <TabsList className="mb-4">
          <TabsTrigger value="game-images">Game Images</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="game-images">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Games List</CardTitle>
                <CardDescription>Select a game to update its image</CardDescription>
              </CardHeader>
              <CardContent>
                {gamesLoading ? (
                  <div className="text-center py-4">Loading games...</div>
                ) : (
                  <div className="h-[500px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games?.map((game: Game) => (
                          <TableRow key={game.id} className={selectedGame?.id === game.id ? "bg-accent" : ""}>
                            <TableCell>{game.id}</TableCell>
                            <TableCell>{game.name}</TableCell>
                            <TableCell>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedGame(game)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Update Game Image</CardTitle>
                <CardDescription>
                  {selectedGame 
                    ? `Update image for: ${selectedGame.name}` 
                    : "Select a game first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedGame ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-image">Current Image</Label>
                        <div className="mt-2 h-[200px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                          {selectedGame.imageUrl ? (
                            <img
                              src={selectedGame.imageUrl}
                              alt={selectedGame.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-muted-foreground">No image available</span>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label htmlFor="image-upload">Upload New Image</Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-2"
                        />
                        
                        {imagePreview && (
                          <div className="mt-4">
                            <Label>Preview</Label>
                            <div className="mt-2 h-[200px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        type="submit" 
                        disabled={!imageFile || uploadMutation.isPending}
                        className="w-full"
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Please select a game from the list
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Update general site settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Site settings functionality will be added soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}