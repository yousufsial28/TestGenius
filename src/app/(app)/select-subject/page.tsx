
"use client";

import Link from "next/link";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
      <div className="w-full max-w-4xl">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 pb-4">
            {classes.map((cls) => (
              <Link key={cls.name} href="/create-test" className="group">
                <Card className="flex h-full w-40 flex-col items-center justify-center p-4 text-center transition-all group-hover:shadow-lg group-hover:border-primary">
                  <BookOpen className="h-12 w-12 text-primary mb-2" />
                  <h2 className="text-lg font-semibold font-headline">{cls.name}</h2>
                </Card>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
