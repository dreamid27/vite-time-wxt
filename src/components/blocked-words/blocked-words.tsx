import { useState, useEffect } from "react";
import { PlusCircle, Trash2, AlertCircle, Loader2, Search, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db } from "@/db/blocked-words-db";
import { BlockedWord } from "@/db/blocked-words-db";

// Form schema for adding a new blocked word
const formSchema = z.object({
  word: z
    .string()
    .min(2, "Word must be at least 2 characters")
    .max(30, "Word must be less than 30 characters")
    .refine((val) => /^[a-zA-Z0-9-_]+$/.test(val), {
      message: "Only letters, numbers, hyphens, and underscores are allowed",
    }),
});

export function BlockedWords() {
  const [blockedWords, setBlockedWords] = useState<BlockedWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<BlockedWord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for adding new blocked words
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
    },
  });

  // Load blocked words from database
  useEffect(() => {
    const loadBlockedWords = async () => {
      try {
        setIsLoading(true);
        const words = await db.blockedWords.toArray();
        setBlockedWords(words);
      } catch (error) {
        console.error("Error loading blocked words:", error);
        toast.error("Failed to load blocked words");
      } finally {
        setIsLoading(false);
      }
    };

    loadBlockedWords();
  }, []);

  // Add a new blocked word
  const handleAddWord = async (values: z.infer<typeof formSchema>) => {
    try {
      const { word } = values;
      const normalizedWord = word.toLowerCase();

      // Check if word already exists
      const exists = blockedWords.some(
        (item) => item.word.toLowerCase() === normalizedWord
      );

      if (exists) {
        toast.error("This word is already in your blocked list");
        return;
      }

      // Add new word to database
      const newWord: BlockedWord = {
        id: crypto.randomUUID(),
        word: normalizedWord,
        createdAt: new Date().toISOString(),
      };

      await db.blockedWords.add(newWord);

      // Update state
      setBlockedWords((prev) => [...prev, newWord]);

      // Reset form
      form.reset();

      // Show success message
      toast.success("Word added to block list", {
        description: `Sites containing "${normalizedWord}" will now be blocked.`,
      });
    } catch (error) {
      console.error("Error adding blocked word:", error);
      toast.error("Failed to add word to block list");
    }
  };

  // Delete a blocked word
  const handleDeleteWord = async () => {
    if (!wordToDelete) return;
    
    try {
      setIsSubmitting(true);

      // Delete from database
      await db.blockedWords.delete(wordToDelete.id);

      // Update state
      setBlockedWords((prev) => prev.filter((item) => item.id !== wordToDelete.id));

      // Show success message
      toast.success("Word removed from block list", {
        description: `"${wordToDelete.word}" has been removed.`,
      });
      
      setWordToDelete(null);
    } catch (error) {
      console.error("Error deleting blocked word:", error);
      toast.error("Failed to remove word from block list");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter blocked words based on search query
  const filteredWords = searchQuery
    ? blockedWords.filter((item) =>
        item.word.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blockedWords;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blocked words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? "Cancel" : "Add New Word"}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Add new word form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-muted/50 p-4 rounded-lg border border-dashed border-muted-foreground/30">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleAddWord)}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <label htmlFor="add-word" className="text-sm font-medium">
                          Word to block
                        </label>
                        <div className="flex gap-2 mt-2">
                          <div className="relative flex-1">
                            <FormField
                              control={form.control}
                              name="word"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      id="add-word"
                                      placeholder="Enter a word to block (e.g., game, social)"
                                      {...field}
                                      autoComplete="off"
                                      className="pl-3 pr-20"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.reset();
                              setIsAdding(false);
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help text */}
          <Alert variant="default" className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How this works</AlertTitle>
            <AlertDescription>
              When you add a word to this list, any website whose domain name
              contains that word will be automatically blocked. For example, adding
              "game" will block domains like "coolmathgames.com" and "gamespot.com".
            </AlertDescription>
          </Alert>

          {/* Words list */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Your Blocked Words
                </div>
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : blockedWords.length === 0 ? (
              <div className="bg-muted/30 rounded-lg py-8 text-center">
                <p className="text-muted-foreground">
                  You haven't added any words to block yet.
                </p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="bg-muted/30 rounded-lg py-8 text-center">
                <p className="text-muted-foreground">No words match your search.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                <AnimatePresence>
                  {filteredWords.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 bg-card rounded-md border"
                    >
                      <Badge variant="outline" className="font-medium">
                        {item.word}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWordToDelete(item)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!wordToDelete} onOpenChange={(open) => !open && setWordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove blocked word</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{wordToDelete?.word}" from your blocked words list?
              Sites containing this word will no longer be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteWord();
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
