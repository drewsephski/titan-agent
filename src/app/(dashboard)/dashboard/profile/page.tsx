import { requireAuth } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Sparkles } from "lucide-react";

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = session.user;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "creator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "buyer":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and view your role
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Overview Card */}
        <Card className="rounded-none border-dashed">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information and current role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <Badge className={`${getRoleBadgeColor(user.role || "buyer")} capitalize mt-1`}>
                        {user.role || "buyer"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.createdAt || 0).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Management Card */}
        <Card className="rounded-none border-dashed">
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Upgrade your account to become a creator</CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === "buyer" ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 border border-dashed">
                  <h3 className="font-semibold mb-2">Become a Creator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As a creator, you can submit AI workflow templates to the marketplace and earn revenue from sales. You&apos;ll need to complete Stripe Connect onboarding to receive payments.
                  </p>
                  <Button disabled>
                    Upgrade to Creator (Coming Soon)
                  </Button>
                </div>
              </div>
            ) : user.role === "creator" ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Creator Status Active</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                    You can submit templates and earn revenue. Complete Stripe Connect onboarding to receive payouts.
                  </p>
                  <Button variant="outline" disabled>
                    Connect Stripe (Coming Soon)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">Admin Access</h3>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    You have full administrative access to the marketplace.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card className="rounded-none border-dashed">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start" disabled>
                <Mail className="w-4 h-4 mr-2" />
                Change Email (Coming Soon)
              </Button>
              <Button variant="outline" className="justify-start text-destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
