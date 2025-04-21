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
import { useAuth } from "@/context/UserContext";
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
          <Card>
            <CardHeader>
              <CardTitle>Game Control</CardTitle>
              <CardDescription>
                Adjust game settings, control outcomes, and manage house edge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Game control cards will be added here */}
                <Card>
                  <CardHeader>
                    <CardTitle>Game Settings</CardTitle>
                    <CardDescription>Coming soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Game control functionality is under development.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}