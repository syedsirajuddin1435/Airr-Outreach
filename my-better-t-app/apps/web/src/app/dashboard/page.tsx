import DashboardLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Stat Cards */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Total Users</CardTitle>
              <CardDescription>
                Monthly active users
              </CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">
              1,234
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Revenue</CardTitle>
              <CardDescription>
                This month's earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">
              $45,678
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
              <CardDescription>
                Currently online users
              </CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">
              89
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Conversion Rate</CardTitle>
              <CardDescription>
                Visitor to customer ratio
              </CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">
              3.2%
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">User signup</p>
                  <p className="text-sm text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">New purchase</p>
                  <p className="text-sm text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                  <span className="text-xl">⚙️</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Settings updated</p>
                  <p className="text-sm text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Chart would go here
              </div>
              <CardFooter className="mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}