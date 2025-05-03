import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Game, UserGameControl } from "@shared/schema";
// Create a typed balance interface
interface UserBalance {
  BTC: number;
  ETH: number;
  USDT: number;
  INR: number;
  [key: string]: number;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Ban, CheckCircle, ChevronsUpDown, Edit, Lock, Plus, RefreshCw, Shield, Trash2, Unlock, Users } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("users");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  
  // Game control state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [forceOutcome, setForceOutcome] = useState<boolean>(false);
  const [outcomeType, setOutcomeType] = useState<string>("win");
  const [durationGames, setDurationGames] = useState<number>(1);
  const [gameControlDialogOpen, setGameControlDialogOpen] = useState(false);
  
  // Slot game specific controls
  const [slotMultiplier, setSlotMultiplier] = useState<number>(0);
  const [showSlotControls, setShowSlotControls] = useState<boolean>(false);
  
  // Global game control state
  const [globalControlAffectedGames, setGlobalControlAffectedGames] = useState<number[]>([]);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
    enabled: user?.isAdmin === true
  });

  // Update user admin status
  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/update-admin", { userId, isAdmin });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      });
    }
  });

  // Ban/unban user
  const updateBanMutation = useMutation({
    mutationFn: async ({ userId, isBanned }: { userId: number; isBanned: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/update-ban", { userId, isBanned });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User ban status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user ban status",
        variant: "destructive",
      });
    }
  });

  // Set user balance
  const setBalanceMutation = useMutation({
    mutationFn: async ({ userId, currency, amount }: { userId: number; currency: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/admin/set-balance", { userId, currency, amount });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User balance updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user balance",
        variant: "destructive",
      });
    }
  });
  
  // Fetch all games
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/games'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/games");
      return await response.json();
    },
    enabled: user?.isAdmin === true
  });
  
  // Fetch user game controls
  const { data: userGameControls, isLoading: controlsLoading, refetch: refetchControls } = useQuery({
    queryKey: ['/api/admin/user-game-controls'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/user-game-controls");
      return await response.json();
    },
    enabled: user?.isAdmin === true
  });
  
  // Create user game control
  const createGameControlMutation = useMutation({
    mutationFn: async (data: { 
      userId: number; 
      gameId: number; 
      forceOutcome: boolean; 
      outcomeType: string;
      durationGames: number;
      forcedOutcomeValue?: any;
    }) => {
      const response = await apiRequest("POST", "/api/admin/user-game-controls", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-game-controls'] });
      setGameControlDialogOpen(false);
      toast({
        title: "Success",
        description: "Game control created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create game control",
        variant: "destructive",
      });
    }
  });
  
  // Update user game control
  const updateGameControlMutation = useMutation({
    mutationFn: async ({ id, data }: { 
      id: number; 
      data: {
        forceOutcome?: boolean;
        outcomeType?: string;
        durationGames?: number;
        forcedOutcomeValue?: any;
      }
    }) => {
      const response = await apiRequest("PUT", `/api/admin/user-game-controls/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-game-controls'] });
      toast({
        title: "Success",
        description: "Game control updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update game control",
        variant: "destructive",
      });
    }
  });
  
  // Delete user game control
  const deleteGameControlMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/user-game-controls/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-game-controls'] });
      toast({
        title: "Success",
        description: "Game control deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete game control",
        variant: "destructive",
      });
    }
  });
  
  // Reset all user game controls
  const resetAllControlsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/reset-all-user-game-controls");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-game-controls'] });
      toast({
        title: "Success",
        description: "All game controls have been reset",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset game controls",
        variant: "destructive",
      });
    }
  });
  
  // Fetch global game control
  const { data: globalControl, isLoading: globalControlLoading, refetch: refetchGlobalControl } = useQuery({
    queryKey: ['/api/admin/global-game-control'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/global-game-control");
      return await response.json();
    },
    enabled: user?.isAdmin === true
  });
  
  // Make all users lose
  const makeAllLoseMutation = useMutation({
    mutationFn: async (affectedGames: number[] = []) => {
      const response = await apiRequest("POST", "/api/admin/global-game-control/lose", { affectedGames });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-game-control'] });
      toast({
        title: "Success",
        description: "All users will now lose on affected games",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update global game control",
        variant: "destructive",
      });
    }
  });
  
  // Make all users win
  const makeAllWinMutation = useMutation({
    mutationFn: async (affectedGames: number[] = []) => {
      const response = await apiRequest("POST", "/api/admin/global-game-control/win", { affectedGames });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-game-control'] });
      toast({
        title: "Success",
        description: "All users will now win on affected games",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update global game control",
        variant: "destructive",
      });
    }
  });
  
  // Reset global game control
  const resetGlobalControlMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/global-game-control/reset");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-game-control'] });
      toast({
        title: "Success",
        description: "Global game controls have been reset",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset global game control",
        variant: "destructive",
      });
    }
  });

  // Handle edit balance
  const handleEditBalance = () => {
    if (!editingUser) return;
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    setBalanceMutation.mutate({
      userId: editingUser.id,
      currency,
      amount,
    });
  };
  
  // Handle create game control
  const handleCreateGameControl = () => {
    if (!selectedUser || !selectedGame) {
      toast({
        title: "Missing Information",
        description: "Please select both a user and a game",
        variant: "destructive",
      });
      return;
    }
    
    // Check if this is a slots game and set forcedOutcomeValue accordingly
    let forcedOutcomeValue = null;
    
    // Game ID 9 is the slots game
    if (selectedGame.id === 9 || selectedGame.slug === 'slots') {
      if (outcomeType === 'win' && slotMultiplier > 0) {
        forcedOutcomeValue = { multiplier: slotMultiplier };
      }
    }
    
    createGameControlMutation.mutate({
      userId: selectedUser.id,
      gameId: selectedGame.id,
      forceOutcome,
      outcomeType,
      durationGames,
      forcedOutcomeValue,
    });
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" /> Admin Panel
          </CardTitle>
          <CardDescription>
            Manage users, control game outcomes, and monitor platform statistics
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <ChevronsUpDown className="h-4 w-4" /> Game Control
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Statistics
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, update balances, and control user permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance (INR)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="default" className="bg-green-600">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(user.balance as UserBalance)?.INR?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setBalanceAmount("");
                              setCurrency("INR");
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isAdmin ? "destructive" : "default"}
                            onClick={() => 
                              updateAdminMutation.mutate({ 
                                userId: user.id, 
                                isAdmin: !user.isAdmin 
                              })
                            }
                          >
                            {user.isAdmin ? (
                              <>
                                <Lock className="h-4 w-4 mr-1" /> Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-1" /> Make Admin
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isBanned ? "default" : "destructive"}
                            onClick={() => 
                              updateBanMutation.mutate({ 
                                userId: user.id, 
                                isBanned: !user.isBanned 
                              })
                            }
                          >
                            {user.isBanned ? (
                              <>
                                <Unlock className="h-4 w-4 mr-1" /> Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-1" /> Ban
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games">
          <div className="grid gap-8">
            {/* Global Game Controls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-red-500">Global Game Control</CardTitle>
                  <CardDescription>
                    Force winning or losing outcomes for ALL users
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    onClick={() => makeAllLoseMutation.mutate(globalControlAffectedGames)}
                  >
                    Make Everyone Lose
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => makeAllWinMutation.mutate(globalControlAffectedGames)}
                  >
                    Allow All Wins
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => resetGlobalControlMutation.mutate()}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Reset Global
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {globalControlLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <h3 className="text-lg font-medium mb-2">Current Global Settings</h3>
                      {globalControl ? (
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <div className="w-40 font-medium">Force All Lose:</div>
                            <div>
                              {globalControl.forceAllUsersLose ? (
                                <Badge variant="destructive">Enabled</Badge>
                              ) : (
                                <Badge variant="outline">Disabled</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-40 font-medium">Force All Win:</div>
                            <div>
                              {globalControl.forceAllUsersWin ? (
                                <Badge className="bg-green-600">Enabled</Badge>
                              ) : (
                                <Badge variant="outline">Disabled</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-40 font-medium">Affected Games:</div>
                            <div>
                              {globalControl.affectedGames && globalControl.affectedGames.length > 0 ? (
                                <span>{globalControl.affectedGames.join(", ")}</span>
                              ) : (
                                <Badge>All Games</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>No global control settings configured.</div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Specify Games to Affect (Optional)</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Leave empty to affect all games. Select specific games to limit control scope.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {games?.map((game: Game) => (
                          <div key={game.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`game-${game.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary"
                              checked={globalControlAffectedGames.includes(game.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGlobalControlAffectedGames([...globalControlAffectedGames, game.id]);
                                } else {
                                  setGlobalControlAffectedGames(
                                    globalControlAffectedGames.filter((id) => id !== game.id)
                                  );
                                }
                              }}
                            />
                            <label htmlFor={`game-${game.id}`} className="text-sm font-medium">
                              {game.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* User-Specific Controls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User-Specific Controls</CardTitle>
                  <CardDescription>
                    Manipulate game outcomes for specific users
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedGame(null);
                      setForceOutcome(false);
                      setOutcomeType("win");
                      setDurationGames(1);
                      setGameControlDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Control
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => resetAllControlsMutation.mutate()}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Reset All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              {controlsLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : userGameControls && userGameControls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Force</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userGameControls.map((control: UserGameControl) => {
                      const controlUser = users?.find(u => u.id === control.userId);
                      const controlGame = games?.find(g => g.id === control.gameId);
                      
                      return (
                        <TableRow key={control.id}>
                          <TableCell>{control.id}</TableCell>
                          <TableCell>{controlUser?.username || 'Unknown'}</TableCell>
                          <TableCell>{controlGame?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            {control.forceOutcome ? (
                              <Badge variant="default" className="bg-blue-600">Enabled</Badge>
                            ) : (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {control.outcomeType === 'win' ? (
                              <Badge variant="default" className="bg-green-600">Win</Badge>
                            ) : (
                              <Badge variant="destructive">Loss</Badge>
                            )}
                          </TableCell>
                          <TableCell>{control.durationGames}</TableCell>
                          <TableCell>{control.gamesPlayed}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateGameControlMutation.mutate({
                                  id: control.id,
                                  data: {
                                    forceOutcome: !control.forceOutcome
                                  }
                                });
                              }}
                            >
                              {control.forceOutcome ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateGameControlMutation.mutate({
                                  id: control.id,
                                  data: {
                                    outcomeType: control.outcomeType === 'win' ? 'loss' : 'win'
                                  }
                                });
                              }}
                            >
                              Toggle Outcome
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteGameControlMutation.mutate(control.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No game controls configured.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedGame(null);
                      setForceOutcome(false);
                      setOutcomeType("win");
                      setDurationGames(1);
                      setGameControlDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Game Control
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>
                Monitor user activity, bets, and financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{users?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {users?.filter((u: User) => !u.isBanned).length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Admin Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {users?.filter((u: User) => u.isAdmin).length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Banned Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {users?.filter((u: User) => u.isBanned).length || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Balance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Balance</DialogTitle>
            <DialogDescription>
              Set exact balance amount for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <select
                id="currency"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter exact amount"
                className="col-span-3"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Current</Label>
              <span className="col-span-3">
                {(editingUser?.balance as UserBalance)?.[currency as keyof UserBalance]?.toFixed(2) || "0.00"} {currency}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBalance} disabled={setBalanceMutation.isPending}>
              {setBalanceMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Updating...
                </>
              ) : (
                "Update Balance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Game Control Dialog */}
      <Dialog open={gameControlDialogOpen} onOpenChange={setGameControlDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create Game Control
              {selectedGame && (
                <span className="text-muted-foreground ml-2 text-sm">
                  (Game ID: {selectedGame.id})
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Set up game outcome control for a specific user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                User
              </Label>
              <select
                id="user"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedUser?.id || ""}
                onChange={(e) => {
                  const userId = parseInt(e.target.value);
                  const userObj = users?.find(u => u.id === userId) || null;
                  setSelectedUser(userObj);
                }}
              >
                <option value="">Select a user</option>
                {users?.filter(u => !u.isBanned).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game" className="text-right">
                Game
              </Label>
              <select
                id="game"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedGame?.id || ""}
                onChange={(e) => {
                  const gameId = parseInt(e.target.value);
                  const gameObj = games?.find(g => g.id === gameId) || null;
                  setSelectedGame(gameObj);
                  
                  // Check if this is the slots game (ID 9 or slug 'slots')
                  if (gameObj && (gameObj.id === 9 || gameObj.slug === 'slots')) {
                    setShowSlotControls(true);
                  } else {
                    setShowSlotControls(false);
                    setSlotMultiplier(0); // Reset slot multiplier when not slots game
                  }
                }}
              >
                <option value="">Select a game</option>
                {games?.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="forceOutcome" className="text-right">
                Force Outcome
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forceOutcome"
                  checked={forceOutcome}
                  onChange={(e) => setForceOutcome(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>{forceOutcome ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outcomeType" className="text-right">
                Outcome Type
              </Label>
              <select
                id="outcomeType"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={outcomeType}
                onChange={(e) => {
                  setOutcomeType(e.target.value);
                  // Reset slot multiplier when changing to loss
                  if (e.target.value === 'loss') {
                    setSlotMultiplier(0);
                  }
                }}
                disabled={!forceOutcome}
              >
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durationGames" className="text-right">
                Duration (games)
              </Label>
              <Input
                id="durationGames"
                type="number"
                placeholder="Number of games"
                className="col-span-3"
                value={durationGames}
                onChange={(e) => setDurationGames(parseInt(e.target.value) || 1)}
                min={1}
                max={100}
                disabled={!forceOutcome}
              />
            </div>
            
            {/* Slot game specific controls */}
            {showSlotControls && outcomeType === 'win' && forceOutcome && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <div className="text-sm font-medium mb-3 text-primary">Slot Game Specific Controls</div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slotMultiplier" className="text-right">
                    Win Multiplier
                  </Label>
                  <select
                    id="slotMultiplier"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={slotMultiplier}
                    onChange={(e) => setSlotMultiplier(Number(e.target.value))}
                  >
                    <option value="0">Random win (any multiplier)</option>
                    <option value="2">2x - Two of the same number</option>
                    <option value="3">3x - Sequential numbers</option>
                    <option value="5">5x - Three of the same number</option>
                    <option value="10">10x - Three 7s or lucky number hit</option>
                  </select>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Select a specific multiplier for the slot game win, or leave as "Random win" for any winning outcome.
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGameControlDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGameControl} 
              disabled={createGameControlMutation.isPending || !selectedUser || !selectedGame}
            >
              {createGameControlMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Creating...
                </>
              ) : (
                "Create Control"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}