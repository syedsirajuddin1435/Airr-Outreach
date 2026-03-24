"use client";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-xl space-y-8 px-4">
        <h1 className="text-3xl font-bold text-center text-primary">
          My Better T App
        </h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">API Status</CardTitle>
            <CardDescription>
              Current status of the backend API connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-4 w-4 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`
              />
              <div>
                <p className="font-medium text-foreground">
                  {healthCheck.isLoading
                    ? "Checking connection..."
                    : healthCheck.data
                      ? "Connected"
                      : "Disconnected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last checked: {healthCheck.data ? new Date().toLocaleTimeString() : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
          <Button variant="outline" size="sm">
            Refresh Status
          </Button>
        </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Button variant="primary" className="w-full">
            Go to AI Chat
          </Button>
          <Button variant="outline" className="w-full">
            View Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}