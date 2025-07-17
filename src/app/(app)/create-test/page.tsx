"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Trash2, Loader2, Sparkles } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { optimizeTestLayout } from "@/ai/flows/optimize-test-layout";
import type { OptimizeTestLayoutInput } from "@/ai/flows/optimize-test-layout";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  testTitle: z.string().min(1, "Test title is required"),
  instructions: z.string().min(1, "Instructions are required"),
  mcqs: z.array(z.object({ value: z.string().min(1, "MCQ cannot be empty") })),
  shortQuestions: z.array(z.object({ value: z.string().min(1, "Question cannot be empty") })),
  longQuestions: z.array(z.object({ value: z.string().min(1, "Question cannot be empty") })),
  fontSize: z.number().min(1).max(72),
  pageWidthPx: z.number().min(100),
  pageHeightPx: z.number().min(100),
  pageWidthCm: z.number().min(1).optional(),
  pageHeightCm: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testTitle: "",
      instructions: "",
      mcqs: [{ value: "" }],
      shortQuestions: [{ value: "" }],
      longQuestions: [{ value: "" }],
      fontSize: 12,
      pageWidthPx: 2480,
      pageHeightPx: 3508, // A4 dimensions
      pageWidthCm: 21,
      pageHeightCm: 29.7,
    },
  });

  const { fields: mcqFields, append: appendMcq, remove: removeMcq } = useFieldArray({
    control: form.control,
    name: "mcqs",
  });
  const { fields: shortFields, append: appendShort, remove: removeShort } = useFieldArray({
    control: form.control,
    name: "shortQuestions",
  });
  const { fields: longFields, append: appendLong, remove: removeLong } = useFieldArray({
    control: form.control,
    name: "longQuestions",
  });
  
  const handlePdfGeneration = async (content: string, title: string) => {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.width = '210mm'; // A4 width
    tempElement.style.padding = '20px';
    tempElement.style.fontFamily = 'Inter, sans-serif';
    tempElement.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 12px;">${content}</pre>`;
    document.body.appendChild(tempElement);
    
    try {
      const canvas = await html2canvas(tempElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const width = pdfWidth;
      const height = width / ratio;

      let position = 0;
      let heightLeft = height;

      pdf.addImage(imgData, 'PNG', 0, position, width, height);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
       console.error("Error generating PDF:", error);
       toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "Could not generate the PDF file. Please try again.",
      });
    } finally {
        document.body.removeChild(tempElement);
    }
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const input: OptimizeTestLayoutInput = {
        testTitle: data.testTitle,
        instructions: data.instructions,
        sections: [
          { title: "Multiple Choice Questions", questions: data.mcqs.map(q => q.value) },
          { title: "Short Questions", questions: data.shortQuestions.map(q => q.value) },
          { title: "Long Questions", questions: data.longQuestions.map(q => q.value) },
        ],
        fontSize: data.fontSize,
        pageWidthPx: data.pageWidthPx,
        pageHeightPx: data.pageHeightPx,
        pageWidthCm: data.pageWidthCm,
        pageHeightCm: data.pageHeightCm,
      };

      const result = await optimizeTestLayout(input);
      setOptimizedResult(result.optimizedLayout);
      
      await handlePdfGeneration(result.optimizedLayout, data.testTitle);

      // Save to local storage
      const savedTests = JSON.parse(localStorage.getItem("savedTests") || "[]");
      savedTests.push({ id: new Date().toISOString(), title: data.testTitle, date: new Date().toLocaleDateString() });
      localStorage.setItem("savedTests", JSON.stringify(savedTests));

      toast({
        title: "Test Generated & Saved!",
        description: "Your test has been successfully optimized, saved, and downloaded.",
      });
    } catch (error) {
      console.error("Error optimizing layout:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the test paper. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderFieldArray = (
    fields: Record<"id", string>[],
    append: (obj: { value: string }) => void,
    remove: (index: number) => void,
    name: "mcqs" | "shortQuestions" | "longQuestions"
  ) => (
    <div>
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={form.control}
          name={`${name}.${index}.value`}
          render={({ field }) => (
            <FormItem className="mb-2">
              <div className="flex items-center gap-2">
                <Input {...field} placeholder={`Enter question #${index + 1}`} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ value: "" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Create a New Test</h1>
        <p className="text-muted-foreground">Fill in the details below to generate your test paper.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="testTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Mid-Term Physics Exam" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Answer all questions. Each question carries 5 marks." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle>Multiple Choice Questions</CardTitle>
                <CardDescription>Add your MCQs here.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderFieldArray(mcqFields, appendMcq, removeMcq, "mcqs")}
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
                <CardTitle>Short Questions</CardTitle>
                <CardDescription>Add your short answer questions.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderFieldArray(shortFields, appendShort, removeShort, "shortQuestions")}
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
                <CardTitle>Long Questions</CardTitle>
                <CardDescription>Add your detailed answer questions.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderFieldArray(longFields, appendLong, removeLong, "longQuestions")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Customization</CardTitle>
                <CardDescription>Adjust the layout and appearance of your test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field: { value, onChange } }) => (
                    <FormItem>
                        <FormLabel>Font Size: {value}px</FormLabel>
                        <FormControl>
                            <Slider
                                defaultValue={[value]}
                                onValueChange={(vals) => onChange(vals[0])}
                                min={1}
                                max={72}
                                step={1}
                            />
                        </FormControl>
                    </FormItem>
                    )}
                />
                 <Separator />
                <div>
                  <FormLabel>Page Size</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                     <FormField
                        control={form.control}
                        name="pageWidthPx"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Width (px)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pageHeightPx"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Height (px)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="pageWidthCm"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Width (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pageHeightCm"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Height (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                        </FormItem>
                        )}
                    />
                  </div>
                </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate & Save PDF
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={!!optimizedResult} onOpenChange={(open) => !open && setOptimizedResult(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Optimized Test Layout</DialogTitle>
            <DialogDescription>
              Here is the AI-optimized text layout for your test. You can now copy this or use a PDF generation tool.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/50 p-4">
            <pre className="whitespace-pre-wrap text-sm font-code">{optimizedResult}</pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setOptimizedResult(null)}>Close</Button>
            <Button
                onClick={() => {
                    navigator.clipboard.writeText(optimizedResult || "");
                    toast({ title: "Copied to clipboard!" });
                }}
            >
                Copy Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
