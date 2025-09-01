import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BookMarked, Calendar, Library, Map } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    title: "Academic Calendar",
    description: "Important dates, deadlines, and holidays for the semester.",
    icon: Calendar,
    href: "#",
    dataAiHint: "calendar icon"
  },
  {
    title: "Campus Map",
    description: "Navigate buildings, parking, and key locations on campus.",
    icon: Map,
    href: "#",
    dataAiHint: "map illustration"
  },
  {
    title: "Library Portal",
    description: "Access digital archives, research databases, and book catalogs.",
    icon: Library,
    href: "#",
    dataAiHint: "library books"
  },
  {
    title: "Course Catalog",
    description: "Browse all available courses, descriptions, and prerequisites.",
    icon: BookMarked,
    href: "#",
    dataAiHint: "course book"
  },
];

export default function ResourcesPage() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">College Resources</h1>
        <p className="text-muted-foreground mt-2">
          Quickly find important campus links and information.
        </p>

        <div className="grid gap-6 mt-8 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="flex flex-col glassmorphism hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={resource.href}>
                    Open Resource <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
