import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Game, UserGameControl, Bet, Transaction } from "@shared/schema";
import { Download, Search, SortDesc, SortAsc } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Ban, CheckCircle, ChevronsUpDown, Edit, History, Lock, Plus, RefreshCw, Shield, Trash2, Unlock, Users, Wallet } from "lucide-react";
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
  
  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Game control state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [forceOutcome, setForceOutcome] = useState<boolean>(false);
  const [outcomeType, setOutcomeType] = useState<string>("win");
  const [durationGames, setDurationGames] = useState<number>(1);
  const [gameControlDialogOpen, setGameControlDialogOpen] = useState(false);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [useExactMultiplier, setUseExactMultiplier] = useState<boolean>(false);
  
  // Slot game specific controls
  const [slotMultiplier, setSlotMultiplier] = useState<number>(0);
  const [showSlotControls, setShowSlotControls] = useState<boolean>(false);
  
  // Global game control state
  const [globalControlAffectedGames, setGlobalControlAffectedGames] = useState<number[]>([]);
  const [globalTargetMultiplier, setGlobalTargetMultiplier] = useState<number>(2.0);
  const [globalUseExactMultiplier, setGlobalUseExactMultiplier] = useState<boolean>(false);
  
  // Withdrawals state
  const [withdrawalSearchQuery, setWithdrawalSearchQuery] = useState("");
  const [withdrawalSortOrder, setWithdrawalSortOrder] = useState<"newest" | "oldest">("newest");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<string>("all");
  
  // User activity state
  const [activityUserId, setActivityUserId] = useState<number | null>(null);
  const [activityGameId, setActivityGameId] = useState<number | null>(null);
  const [activityDateRange, setActivityDateRange] = useState<"all" | "today" | "week" | "month">("all");
  
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
    mutationFn: async ({
      affectedGames = []
    }: {
      affectedGames?: number[];
    }) => {
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
    mutationFn: async ({
      affectedGames = [],
      targetMultiplier = 2.0,
      useExactMultiplier = false
    }: {
      affectedGames?: number[];
      targetMultiplier?: number;
      useExactMultiplier?: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/admin/global-game-control/win", {
        affectedGames,
        targetMultiplier,
        useExactMultiplier
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-game-control'] });
      toast({
        title: "Success",
        description: useExactMultiplier 
          ? `All users will now win exactly ${globalTargetMultiplier}x on affected games`
          : "All users will now win on affected games",
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
  
  // Fetch withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/admin/withdrawals'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/transactions?type=WITHDRAWAL");
      return await response.json();
    },
    enabled: user?.isAdmin === true && selectedTab === "withdrawals"
  });
  
  // Approve withdrawal
  const approveWithdrawalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/transactions/${id}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      toast({
        title: "Success",
        description: "Withdrawal has been approved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    }
  });
  
  // Reject withdrawal
  const rejectWithdrawalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/transactions/${id}/reject`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      toast({
        title: "Success",
        description: "Withdrawal has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  });
  
  // Fetch user activity data (bets)
  const { data: userBets, isLoading: userBetsLoading } = useQuery({
    queryKey: ['/api/admin/bets', activityUserId, activityGameId, activityDateRange],
    queryFn: async () => {
      // Build the query parameters
      const params = new URLSearchParams();
      if (activityUserId) params.append('userId', activityUserId.toString());
      if (activityGameId) params.append('gameId', activityGameId.toString());
      
      // Log what we're fetching for debugging
      console.log(`Fetching bet history for user ID: ${activityUserId || 'all'}, game ID: ${activityGameId || 'all'}`);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/admin/bets${queryString}`);
      
      if (!response.ok) {
        console.error('Failed to fetch bet history:', response.status, response.statusText);
        throw new Error('Failed to fetch bet history');
      }
      
      const data = await response.json();
      
      // Apply date filtering if needed
      if (activityDateRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (activityDateRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0); // Start of today
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7); // 7 days ago
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1); // 30 days ago
            break;
        }
        
        // Filter by date
        return data.filter((bet: Bet) => new Date(bet.createdAt) >= cutoffDate);
      }
      
      // If specifically looking at user 1039, log detailed data for debugging
      if (activityUserId === 1039) {
        console.log('Detailed user 1039 bet data:', data);
      }
      
      return data;
    },
    enabled: user?.isAdmin === true && selectedTab === "activity"
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
  
  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    // First filter users based on search query
    let filtered = users.filter((user: User) => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(query) ||
        (user.fullName && user.fullName.toLowerCase().includes(query)) ||
        (user.phone && user.phone.toLowerCase().includes(query))
      );
    });
    
    // Then sort based on creation date
    return filtered.sort((a: User, b: User) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [users, searchQuery, sortOrder]);
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };
  
  // Filter withdrawals
  const filteredWithdrawals = useMemo(() => {
    if (!withdrawals) return [];
    
    // Filter by search query
    let filtered = withdrawals.filter((transaction: Transaction) => {
      if (!withdrawalSearchQuery) return true;
      
      const query = withdrawalSearchQuery.toLowerCase();
      // Search by user ID, username, or description
      return (
        transaction.userId.toString().includes(query) ||
        (transaction.description && transaction.description.toLowerCase().includes(query))
      );
    });
    
    // Filter by status
    if (withdrawalStatusFilter !== 'all') {
      filtered = filtered.filter((transaction: Transaction) => 
        transaction.status.toLowerCase() === withdrawalStatusFilter.toLowerCase()
      );
    }
    
    // Sort by date
    return filtered.sort((a: Transaction, b: Transaction) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      return withdrawalSortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [withdrawals, withdrawalSearchQuery, withdrawalStatusFilter, withdrawalSortOrder]);
  
  // Toggle withdrawal sort order
  const toggleWithdrawalSortOrder = () => {
    setWithdrawalSortOrder(withdrawalSortOrder === "newest" ? "oldest" : "newest");
  };
  
  // Download users as CSV
  const downloadUsersCSV = () => {
    if (!filteredUsers.length) {
      toast({
        title: "No Data",
        description: "There are no users to export",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV header
    const headers = [
      "ID", 
      "Username", 
      "Full Name", 
      "Email", 
      "Phone", 
      "Balance (INR)", 
      "Is Admin", 
      "Status", 
      "Created At"
    ];
    
    // Convert users to CSV rows
    const csvData = filteredUsers.map((user: User) => [
      user.id,
      user.username,
      user.fullName || "",
      user.email || "",
      user.phone || "",
      typeof user.balance === 'number' 
        ? user.balance.toFixed(2) 
        : (user.balance as UserBalance)?.INR?.toFixed(2) || "0.00",
      user.isAdmin ? "Yes" : "No",
      user.isBanned ? "Banned" : "Active",
      new Date(user.createdAt).toLocaleString()
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <ChevronsUpDown className="h-4 w-4" /> Game Control
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Withdrawals
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <History className="h-4 w-4" /> User Activity
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
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between items-end">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or phone..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="flex items-center gap-1"
                  >
                    {sortOrder === "newest" ? (
                      <>
                        <SortDesc className="h-4 w-4" /> Newest First
                      </>
                    ) : (
                      <>
                        <SortAsc className="h-4 w-4" /> Oldest First
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadUsersCSV}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Download CSV
                  </Button>
                </div>
              </div>
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
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance (INR)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName || "-"}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
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
                          {typeof user.balance === 'number' 
                            ? user.balance.toFixed(2) 
                            : (user.balance as UserBalance)?.INR?.toFixed(2) || "0.00"}
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
                    onClick={() => makeAllLoseMutation.mutate({
                      affectedGames: globalControlAffectedGames
                    })}
                  >
                    Make Everyone Lose
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => makeAllWinMutation.mutate({
                      affectedGames: globalControlAffectedGames,
                      targetMultiplier: globalTargetMultiplier,
                      useExactMultiplier: globalUseExactMultiplier
                    })}
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
                            <div className="w-40 font-medium">Target Multiplier:</div>
                            <div>
                              <Badge variant={globalControl.useExactMultiplier ? "default" : "outline"}>
                                {globalControl.targetMultiplier || 2.0}x
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-40 font-medium">Exact Multiplier:</div>
                            <div>
                              {globalControl.useExactMultiplier ? (
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
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Exact Multiplier Control</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Force users to win exactly a specific multiplier amount (such as 2x)
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="exact-multiplier-toggle" 
                              checked={globalUseExactMultiplier}
                              onCheckedChange={(checked) => setGlobalUseExactMultiplier(checked === true)}
                            />
                            <label 
                              htmlFor="exact-multiplier-toggle" 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Use exact multiplier for wins
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 items-center">
                            <label htmlFor="target-multiplier" className="text-sm font-medium">
                              Target Multiplier Value:
                            </label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="target-multiplier"
                                type="number"
                                min="1.01"
                                step="0.1"
                                value={globalTargetMultiplier}
                                onChange={(e) => setGlobalTargetMultiplier(parseFloat(e.target.value))}
                                className="w-24"
                                disabled={!globalUseExactMultiplier}
                              />
                              <span className="text-sm font-bold">x</span>
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              When enabled, users will win exactly {globalTargetMultiplier}x their bet amount 
                              instead of the usual randomized amount determined by the game.
                            </p>
                          </div>
                        </div>
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

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Management</CardTitle>
              <CardDescription>
                View and process user withdrawal requests
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between items-end">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user ID or description..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={withdrawalSearchQuery}
                    onChange={(e) => setWithdrawalSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="border border-gray-300 rounded-md p-2 bg-background"
                    value={withdrawalStatusFilter}
                    onChange={(e) => setWithdrawalStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleWithdrawalSortOrder}
                    className="flex items-center gap-1"
                  >
                    {withdrawalSortOrder === "newest" ? (
                      <>
                        <SortDesc className="h-4 w-4" /> Newest First
                      </>
                    ) : (
                      <>
                        <SortAsc className="h-4 w-4" /> Oldest First
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.length > 0 ? (
                      filteredWithdrawals.map((transaction: Transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.userId}</TableCell>
                          <TableCell>{transaction.amount.toFixed(2)} {transaction.currency}</TableCell>
                          <TableCell>{transaction.description || "Standard Withdrawal"}</TableCell>
                          <TableCell>
                            {transaction.status === "PENDING" && (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>
                            )}
                            {transaction.status === "COMPLETED" && (
                              <Badge variant="default" className="bg-green-600">Completed</Badge>
                            )}
                            {transaction.status === "REJECTED" && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                            {transaction.status === "FAILED" && (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            {transaction.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => approveWithdrawalMutation.mutate(transaction.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectWithdrawalMutation.mutate(transaction.id)}
                                >
                                  <Ban className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No withdrawals found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Gaming Activity</CardTitle>
              <CardDescription>
                Monitor user betting activity and gaming patterns
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between items-end">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div>
                    <Label>Select User</Label>
                    <select 
                      className="border border-gray-300 rounded-md p-2 bg-background w-full mt-1"
                      value={activityUserId || ""}
                      onChange={(e) => setActivityUserId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">All Users</option>
                      {users?.map((user: User) => (
                        <option key={user.id} value={user.id}>
                          {user.username} (ID: {user.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Select Game</Label>
                    <select 
                      className="border border-gray-300 rounded-md p-2 bg-background w-full mt-1"
                      value={activityGameId || ""}
                      onChange={(e) => setActivityGameId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">All Games</option>
                      {games?.map((game: Game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Time Period</Label>
                    <select 
                      className="border border-gray-300 rounded-md p-2 bg-background w-full mt-1"
                      value={activityDateRange}
                      onChange={(e) => setActivityDateRange(e.target.value as any)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userBetsLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Total Bets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {userBets?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Total Wagered</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {userBets ? userBets.reduce((sum: number, bet: Bet) => sum + bet.amount, 0).toFixed(2) : "0.00"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Total Wins</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-green-500">
                          {userBets ? userBets.filter((bet: Bet) => bet.profit > 0).length || 0 : 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Total Losses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-red-500">
                          {userBets ? userBets.filter((bet: Bet) => bet.profit <= 0).length || 0 : 0}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Bets table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userBets && userBets.length > 0 ? (
                        userBets.map((bet: Bet) => (
                          <TableRow key={bet.id}>
                            <TableCell>{bet.id}</TableCell>
                            <TableCell>{bet.userId}</TableCell>
                            <TableCell>
                              {games?.find(g => g.id === bet.gameId)?.name || `Game #${bet.gameId}`}
                            </TableCell>
                            <TableCell>{bet.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {bet.profit > 0 ? (
                                <Badge className="bg-green-600">Win</Badge>
                              ) : (
                                <Badge variant="destructive">Loss</Badge>
                              )}
                            </TableCell>
                            <TableCell className={bet.profit > 0 ? "text-green-500" : "text-red-500"}>
                              {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {new Date(bet.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No bet data found with the selected filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Balance</DialogTitle>
            <DialogDescription>
              Set exact balance amount for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {/* User Information Summary */}
          <div className="bg-muted p-4 rounded-md mb-4">
            <h3 className="text-sm font-semibold mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Username:</div>
              <div>{editingUser?.username}</div>
              
              <div className="font-medium">Full Name:</div>
              <div>{editingUser?.fullName || "-"}</div>
              
              <div className="font-medium">Phone:</div>
              <div>{editingUser?.phone || "-"}</div>
              
              <div className="font-medium">Email:</div>
              <div className="truncate">{editingUser?.email || "-"}</div>
              
              <div className="font-medium">Status:</div>
              <div>{editingUser?.isBanned ? "Banned" : "Active"}</div>
              
              <div className="font-medium">Created:</div>
              <div>{editingUser?.createdAt ? new Date(editingUser.createdAt).toLocaleString() : "-"}</div>
            </div>
          </div>
          
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
                {currency === 'INR' && typeof editingUser?.balance === 'number'
                  ? `${editingUser.balance.toFixed(2)} ${currency}`
                  : `${(editingUser?.balance as UserBalance)?.[currency as keyof UserBalance]?.toFixed(2) || "0.00"} ${currency}`}
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