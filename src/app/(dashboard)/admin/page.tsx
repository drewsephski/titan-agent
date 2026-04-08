import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { templates, purchases, user } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Package, 
  AlertCircle,
  DollarSign
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch stats
  const pendingCerts = await db
    .select({ count: count() })
    .from(templates)
    .where(
      and(
        eq(templates.status, "draft"),
        eq(templates.certificationStatus, "pending")
      )
    );

  const publishedTemplates = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.status, "published"));

  const totalUsers = await db.select({ count: count() }).from(user);

  const totalPurchases = await db
    .select({ count: count(), revenue: sql<number>`sum(price_paid)` })
    .from(purchases)
    .where(eq(purchases.status, "active"));

  const stats = {
    pendingCertifications: pendingCerts[0]?.count || 0,
    publishedTemplates: publishedTemplates[0]?.count || 0,
    totalUsers: totalUsers[0]?.count || 0,
    totalPurchases: totalPurchases[0]?.count || 0,
    revenue: totalPurchases[0]?.revenue || 0,
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Admin
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Certifications
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCertifications}</div>
            <p className="text-xs text-muted-foreground">
              Templates awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Templates
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Active in marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.revenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalPurchases} purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Certification Queue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review and certify submitted templates
            </p>
            {stats.pendingCertifications > 0 && (
              <Badge variant="secondary" className="mb-4">
                {stats.pendingCertifications} pending
              </Badge>
            )}
            <Button asChild className="w-full">
              <Link href="/admin/certification">
                Review Templates
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-lg">User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage users and role assignments
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle className="text-lg">Disputes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Handle payment disputes and refunds
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/admin/disputes">View Disputes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
