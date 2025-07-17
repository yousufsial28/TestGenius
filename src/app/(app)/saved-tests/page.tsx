"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trash2 } from 'lucide-react';

interface SavedTest {
  id: string;
  title: string;
  date: string;
}

export default function SavedTestsPage() {
  const [savedTests, setSavedTests] = useState<SavedTest[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const tests = JSON.parse(localStorage.getItem('savedTests') || '[]');
    setSavedTests(tests);
  }, []);

  const deleteTest = (id: string) => {
    const updatedTests = savedTests.filter(test => test.id !== id);
    setSavedTests(updatedTests);
    localStorage.setItem('savedTests', JSON.stringify(updatedTests));
  };
  
  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Saved Tests</h1>
        <p className="text-muted-foreground">
          Access and manage your previously generated test papers.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Collection</CardTitle>
          <CardDescription>
            {savedTests.length > 0
              ? `You have ${savedTests.length} saved test${savedTests.length > 1 ? 's' : ''}.`
              : 'You have no saved tests yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedTests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="mr-2">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTest(test.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">No tests found</h3>
              <p className="text-sm text-muted-foreground">
                Your saved tests will appear here once you create them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
