"use client";

import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000, // 1 minute
				refetchOnWindowFocus: false,
			},
		},
	}));

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				enableSystem
				disableTransitionOnChange
			>
				<Toaster position="top-right" />
				{children}
			</ThemeProvider>
		</QueryClientProvider>
	);
}