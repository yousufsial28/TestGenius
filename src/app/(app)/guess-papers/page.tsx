"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { generateGuessPaperTemplate } from "@/ai/flows/generate-guess-paper-templates";
import type { GenerateGuessPaperTemplateOutput } from "@/ai/flows/generate-guess-paper-templates";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function GuessPapersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<GenerateGuessPaperTemplateOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      difficulty: "medium",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setTemplate(null);
    try {
      const result = await generateGuessPaperTemplate(data);
      setTemplate(result);
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the guess paper. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <div className="sticky top-24">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Guess Papers</h1>
            <p className="text-muted-foreground mb-6">
                Generate educational templates with AI.
            </p>
            <Card>
                <CardHeader>
                <CardTitle>Generator</CardTitle>
                <CardDescription>Select a subject and difficulty.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="mathematics">Mathematics</SelectItem>
                                <SelectItem value="physics">Physics</SelectItem>
                                <SelectItem value="chemistry">Chemistry</SelectItem>
                                <SelectItem value="biology">Biology</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                                </SelectContent>
                            </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Template
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="md:col-span-2">
        {isLoading && (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )}
        {!isLoading && !template && (
            <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Wand2 className="h-8 w-8 text-muted-foreground" />
                 </div>
                <h3 className="text-xl font-bold tracking-tight">Your Template Awaits</h3>
                <p className="text-sm text-muted-foreground">
                Select your options and click generate to see the magic happen.
                </p>
            </div>
        )}
        {template && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">{template.title}</CardTitle>
              <CardDescription>{template.introduction}</CardDescription>
            </CardHeader>
            <CardContent>
              {template.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((question, qIndex) => (
                      <AccordionItem key={qIndex} value={`item-${qIndex}`}>
                        <AccordionTrigger>
                          <span className="text-left">Question {qIndex + 1}: {question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="bg-secondary/50 p-4 rounded-md">
                          <strong>Answer:</strong> {section.answers[qIndex]}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {sectionIndex < template.sections.length -1 && <Separator className="my-6"/>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
