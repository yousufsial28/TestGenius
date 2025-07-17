import Link from "next/link";
import { FilePlus2, Save, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Create New Test",
    href: "/create-test",
    icon: <FilePlus2 className="h-12 w-12" />,
    description: "Start from scratch and build a new test paper.",
    cta: "Create Now",
  },
  {
    title: "Saved Tests",
    href: "/saved-tests",
    icon: <Save className="h-12 w-12" />,
    description: "Access and manage your previously generated tests.",
    cta: "View Saved",
  },
  {
    title: "Guess Papers",
    href: "/guess-papers",
    icon: <Newspaper className="h-12 w-12" />,
    description: "Explore pre-made templates provided by administrators.",
    cta: "Explore Templates",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome to Your Dashboard
        </h1>
        <p className="text-muted-foreground">
          What would you like to do today?
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col transition-all hover:shadow-lg"
          >
            <CardHeader className="flex-1">
              <div className="mb-4 text-primary">{feature.icon}</div>
              <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground flex-1">{feature.description}</p>
              <Button asChild className="mt-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={feature.href}>{feature.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
