"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const classes = [
  {
    name: "9th Class",
    description: "Subjects for 9th grade.",
  },
  {
    name: "10th Class",
    description: "Subjects for 10th grade.",
  },
  {
    name: "11th Class",
    description: "Subjects for 11th grade.",
  },
  {
    name: "12th Class",
    description: "Subjects for 12th grade.",
  },
];

export default function SelectSubjectPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Select Your Class</h1>
        <p className="text-muted-foreground">
          Choose a class to begin creating your test paper.
        </p>
      </div>
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {classes.map((cls) => (
          <Card key={cls.name} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="flex-1">
              <div className="mb-4 text-primary">
                <BookOpen className="h-12 w-12" />
              </div>
              <CardTitle className="font-headline text-xl">{cls.name}</CardTitle>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/create-test">Select</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
