import { requireCreator } from "@/lib/auth-server";
import TemplateSubmissionForm from "@/components/templates/template-submission-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function SubmitTemplatePage() {
	const session = await requireCreator();

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<div className="flex items-center gap-4 mb-6">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/creator">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Dashboard
					</Link>
				</Button>
			</div>

			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Submit Template</h1>
				<p className="text-muted-foreground">
					Share your AI workflow with the community. Templates undergo certification
					before being published.
				</p>
			</div>

			<TemplateSubmissionForm />
		</div>
	);
}

