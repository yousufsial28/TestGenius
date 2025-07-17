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
import type { OptimizeTestLayoutOutput, OptimizeTestLayoutInput } from "@/ai/flows/optimize-test-layout";

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
  const [optimizedResult, setOptimizedResult] = useState<OptimizeTestLayoutOutput | null>(null);
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
  
  const generatePdfContent = (data: OptimizeTestLayoutOutput) => {
    const { testTitle, sections } = data;
    
    let html = `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 14px; border: 1px solid black; padding: 5px;">
        <div style="border: 3px solid black; padding: 20px; min-height: 29.7cm;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 20px; font-weight: bold;">${testTitle}</h1>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Student Name:</strong> ____________________</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Roll Number:</strong> _____________________</span>
            </div>
            <hr style="border-top: 1px solid black; margin-bottom: 20px;" />`;

    sections.forEach(section => {
        html += `<div style="border: 1px solid black; padding: 10px; margin-bottom: 20px;">
                    <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">${section.title}</h2>`;
        section.questions.forEach((q, index) => {
             html += `<div style="margin-left: 3px; margin-bottom: 10px;">
                        <p style="margin: 0;"><strong>${index + 1}.</strong> ${q}</p>
                      </div>`;
        });
        html += `</div>`;
    });

    html += `</div></div>`;
    return html;
  };

  const handlePdfGeneration = async (data: OptimizeTestLayoutOutput, title: string) => {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.width = '210mm'; // A4 width
    tempElement.style.background = 'white';
    tempElement.innerHTML = generatePdfContent(data);
    document.body.appendChild(tempElement);
    
    try {
      const canvas = await html2canvas(tempElement, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -pdfHeight; // Start from the top of the new page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
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
        if(document.body.contains(tempElement)) {
            document.body.removeChild(tempElement);
        }
    }
  }


  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const input: OptimizeTestLayoutInput = {
        testTitle: data.testTitle,
        instructions: data.instructions,
        sections: [
          { title: "MCQs", questions: data.mcqs.map(q => q.value) },
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
      setOptimizedResult(result);
      
      await handlePdfGeneration(result, data.testTitle);

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
              Here is the AI-optimized layout for your test. Your PDF has been downloaded.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/50 p-4">
            {optimizedResult && <pre className="whitespace-pre-wrap text-sm font-code">{JSON.stringify(optimizedResult, null, 2)}</pre>}
          </div>
          <DialogFooter>
            <Button onClick={() => setOptimizedResult(null)}>Close</Button>
            <Button
                onClick={() => {
                    if (optimizedResult) {
                        navigator.clipboard.writeText(JSON.stringify(optimizedResult, null, 2));
                        toast({ title: "Copied to clipboard!" });
                    }
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
