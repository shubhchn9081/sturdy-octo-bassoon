{/* User Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Dashboard</CardTitle>
              <CardDescription>
                Monitor user betting, deposits, withdrawals and all activity
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between items-end">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
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
                    <Label>Activity Type</Label>
                    <select 
                      className="border border-gray-300 rounded-md p-2 bg-background w-full mt-1"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      <option value="all">All Activities</option>
                      <option value="bet">Bets Only</option>
                      <option value="deposit">Deposits Only</option>
                      <option value="withdrawal">Withdrawals Only</option>
                    </select>
                  </div>
                  <div>
                    <Label>Select Game</Label>
                    <select 
                      className="border border-gray-300 rounded-md p-2 bg-background w-full mt-1"
                      value={activityGameId || ""}
                      onChange={(e) => setActivityGameId(e.target.value ? parseInt(e.target.value) : null)}
                      disabled={activityType === "deposit" || activityType === "withdrawal"}
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
              {userActivitiesLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Total Activities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userActivities?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Bets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userActivities ? userActivities.filter((a: any) => a.type === 'bet').length : 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Deposits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                          {userActivities ? userActivities.filter((a: any) => a.type === 'deposit').length : 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold">Withdrawals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-500">
                          {userActivities ? userActivities.filter((a: any) => a.type === 'withdrawal').length : 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* User Activity Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity History</CardTitle>
                      <CardDescription>
                        View detailed user activity information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Details</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userActivities && userActivities.length > 0 ? (
                              userActivities.map((activity: any) => (
                                <TableRow key={activity.id}>
                                  <TableCell>
                                    {activity.username || `User ${activity.userId}`}
                                  </TableCell>
                                  <TableCell>
                                    {activity.type === 'bet' ? (
                                      <span className="flex items-center">
                                        <ChevronsUpDown className="h-4 w-4 mr-1" />
                                        Bet
                                      </span>
                                    ) : activity.type === 'deposit' ? (
                                      <span className="flex items-center text-green-500">
                                        <ArrowDownLeft className="h-4 w-4 mr-1" />
                                        Deposit
                                      </span>
                                    ) : (
                                      <span className="flex items-center text-orange-500">
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                        Withdrawal
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {activity.type === 'bet' ? (
                                      <span>
                                        {activity.gameName || `Game ${activity.gameId}`} 
                                        ({activity.outcome === 'win' ? 
                                          <span className="text-green-500">Win</span> : 
                                          <span className="text-red-500">Loss</span>})
                                      </span>
                                    ) : (
                                      <span>
                                        {activity.description || activity.type}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {activity.type === 'bet' ? (
                                      <span>
                                        {activity.amount?.toFixed(2)} {activity.currency}
                                        {activity.profit && (
                                          <span className={activity.profit > 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                                            ({activity.profit > 0 ? '+' : ''}{activity.profit.toFixed(2)})
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span className={activity.type === 'deposit' ? 'text-green-500' : 'text-orange-500'}>
                                        {activity.type === 'deposit' ? '+' : '-'} {activity.amount?.toFixed(2)} {activity.currency}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        activity.status === 'completed' || activity.status === 'COMPLETED' ? 'default' :
                                        activity.status === 'pending' || activity.status === 'PENDING' ? 'outline' :
                                        'destructive'
                                      }
                                      className={
                                        activity.status === 'completed' || activity.status === 'COMPLETED' ? 'bg-green-600' :
                                        activity.status === 'pending' || activity.status === 'PENDING' ? 'text-yellow-500 border-yellow-500' :
                                        ''
                                      }
                                    >
                                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).toLowerCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{new Date(activity.createdAt).toLocaleString()}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                  No activity found for the selected filters
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>