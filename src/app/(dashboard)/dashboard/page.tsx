import { getUser } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
	const user = await getUser();

	return (
		<div className="flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] px-4">
			<Card className="w-full max-w-2xl shadow-lg border-muted/20 bg-card/50 backdrop-blur-sm rounded-none border-dashed">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-primary"
						>
							<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
					<CardTitle className="text-xl md:text-2xl font-semibold tracking-tight">Protected Dashboard</CardTitle>
					<CardDescription className="text-muted-foreground">
						This is a protected route accessible only to authenticated users.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/50 p-8 text-center">
						<h3 className="font-medium text-muted-foreground mb-1">Your Dashboard Awaits</h3>
						<p className="text-sm text-muted-foreground/70 mb-6">
							Start building your ideal dashboard by adding components and data visualizations.
						</p>
						<div className="flex items-center justify-center gap-2">
							<Button asChild>
								<Link href="/">Go Home</Link>
							</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between border-t border-muted/20 pt-4 text-xs text-muted-foreground/70">
					<p>Signed in as: {user?.email}</p>
					<p>Built with <Link href="/" className="font-bold hover:underline">Titan</Link></p>
				</CardFooter>
			</Card>
		</div>
	);
}