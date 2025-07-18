
"use client";

import Link from "next/link";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const classes = [
  {
    name: "9th Class",
  },
  {
    name: "10th Class",
  },
  {
    name: "11th Class",
  },
  {
    name: "12th Class",
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
          <Link key={cls.name} href="/create-test" className="group">
            <Card className="flex h-full flex-col items-center justify-center p-6 text-center transition-all group-hover:shadow-lg group-hover:border-primary">
              <BookOpen className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-xl font-semibold font-headline">{cls.name}</h2>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
