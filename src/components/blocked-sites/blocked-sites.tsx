import { useState, useEffect } from "react";
import { db, BlockedSite } from "@/db/blocked-sites-db";
import { Loader2, Plus, Search, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BlockedSitesForm } from "./blocked-sites-form";
import { BlockedSiteItem } from "./blocked-site-item";
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
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Helper function to normalize URL for comparison
const normalizeUrl = (url: string) => {
  try {
    // Remove protocol and www. prefix, and trailing slashes for comparison
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace("www.", "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

type BlockedSiteFormValues = {
  url: string;
};

export function BlockedSites() {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<BlockedSite | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form schema factory function
  const createFormSchema = (currentEditingSiteId: string | null) =>
    z.object({
      url: z
        .string()
        .min(1, "URL is required")
        .regex(
          /^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|[\d\.]+)([\/:?=&#]{1}[\da-z\.-]+)*\/?$/i,
          "Please enter a valid URL"
        )
        .refine(
          async (url) => {
            // Skip validation if we're editing
            if (currentEditingSiteId) return true;

            const normalizedUrl = normalizeUrl(url);
            const existingSites = await db.blockedSites.toArray();
            return !existingSites.some(
              (site) =>
                site.id !== currentEditingSiteId && // Skip current site when editing
                normalizeUrl(site.url) === normalizedUrl
            );
          },
          {
            message: "This site is already in your blocked list",
          }
        ),
    });

  // Create form schemas
  const addFormSchema = createFormSchema(null);
  const editFormSchema = (editingId: string) => createFormSchema(editingId);

  const addForm = useForm<BlockedSiteFormValues>({
    resolver: zodResolver(addFormSchema),
    defaultValues: { url: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const editForm = useForm<BlockedSiteFormValues>({
    resolver: editingSiteId
      ? zodResolver(editFormSchema(editingSiteId))
      : undefined,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sites = await db.blockedSites
        .orderBy("createdAt")
        .reverse()
        .toArray();
      setBlockedSites(sites);
      setLoading(false);
    })();
  }, []);

  const filteredSites = blockedSites.filter((site) =>
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSite = async (data: { url: string }) => {
    try {
      setIsSubmitting(true);

      // Normalize the URL for storage
      const normalizedUrl = data.url.startsWith("http")
        ? data.url
        : `https://${data.url}`;

      // Check again if the site already exists (as a final check)
      const existingSites = await db.blockedSites.toArray();
      const alreadyExists = existingSites.some(
        (site) => normalizeUrl(site.url) === normalizeUrl(normalizedUrl)
      );

      if (alreadyExists) {
        toast.error("Site already blocked", {
          description: "This site is already in your blocked list.",
        });
        return;
      }

      const newSite: BlockedSite = {
        id: crypto.randomUUID(),
        url: normalizedUrl,
        createdAt: new Date().toISOString(),
      };

      await db.blockedSites.add(newSite);
      const updatedSites = await db.blockedSites
        .orderBy("createdAt")
        .reverse()
        .toArray();
      setBlockedSites(updatedSites);
      addForm.reset();

      toast.success("Site blocked", {
        description: `${
          new URL(normalizedUrl).hostname
        } has been added to your blocked list.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add site. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsAdding(false);
    }
  };

  const handleUpdateSite = async (data: { url: string }, siteId: string) => {
    try {
      setIsSubmitting(true);
      await db.blockedSites.update(siteId, { url: data.url });
      const updatedSites = await db.blockedSites
        .orderBy("createdAt")
        .reverse()
        .toArray();
      setBlockedSites(updatedSites);
      setEditingSiteId(null);
      toast.success("Site updated", {
        description: "The blocked site has been updated.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update site. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;
    try {
      setIsSubmitting(true);
      await db.blockedSites.delete(siteToDelete.id);
      const updatedSites = await db.blockedSites
        .orderBy("createdAt")
        .reverse()
        .toArray();
      setBlockedSites(updatedSites);
      setSiteToDelete(null);
      toast.success("Site unblocked", {
        description: `${
          new URL(
            siteToDelete.url.startsWith("http")
              ? siteToDelete.url
              : `https://${siteToDelete.url}`
          ).hostname
        } has been removed from your blocked list.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to unblock site. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (site: BlockedSite) => {
    setEditingSiteId(site.id);
    editForm.reset({ url: site.url });
  };

  const cancelEditing = () => {
    setEditingSiteId(null);
    editForm.reset();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-muted-foreground">Loading blocked sites...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blocked sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Add Site Form */}
          <AnimatePresence>
            (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/50 p-4 rounded-lg border border-dashed border-muted-foreground/30">
                <form
                  onSubmit={addForm.handleSubmit(handleAddSite)}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <label htmlFor="add-url" className="text-sm font-medium">
                      Website URL to block
                    </label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1 ">
                        <Input
                          id="add-url"
                          placeholder="example.com"
                          className="pl-3 pr-20"
                          disabled={isSubmitting}
                          {...addForm.register("url")}
                        />
                        {addForm.formState.errors.url && (
                          <p className="mt-2 text-xs text-destructive">
                            {addForm.formState.errors.url.message}
                          </p>
                        )}
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
                          addForm.reset();
                        }}
                        disabled={isSubmitting}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
            )
          </AnimatePresence>

          {/* Blocked Sites List */}
          {filteredSites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed"
            >
              <div className="rounded-full bg-muted p-4 mb-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                {searchTerm
                  ? "No matching sites found"
                  : "No sites blocked yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {searchTerm
                  ? "Try a different search term or add a new site to your block list."
                  : "Block distracting websites to improve your productivity. Click 'Add Site' to get started."}
              </p>
              {!searchTerm && !isAdding && (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first site
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSites.map((site) => (
                <motion.div
                  key={site.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.2 }}
                >
                  {editingSiteId === site.id ? (
                    <div className="bg-muted/50 p-4 rounded-lg border border-muted-foreground/30">
                      <form
                        onSubmit={editForm.handleSubmit((data) =>
                          handleUpdateSite(data, site.id)
                        )}
                        className="space-y-3"
                      >
                        <div className="space-y-3">
                          <label className="text-sm font-medium block">
                            Edit blocked site
                          </label>
                          <div className="space-y-2">
                            <div className="relative">
                              <Input
                                placeholder="example.com"
                                disabled={isSubmitting}
                                className="w-full"
                                {...editForm.register("url")}
                              />
                              {editForm.formState.errors.url && (
                                <p className="absolute -bottom-5 left-0 text-xs text-destructive">
                                  {editForm.formState.errors.url.message}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                                disabled={isSubmitting}
                                className="px-4"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                                className="px-4"
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <BlockedSiteItem
                      site={site}
                      onEdit={startEditing}
                      onDelete={setSiteToDelete}
                      isEditing={editingSiteId === site.id}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog
        open={!!siteToDelete}
        onOpenChange={(open) => !open && setSiteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <ShieldOff className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Unblock this site?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  {siteToDelete && (
                    <span className="font-medium">
                      {
                        new URL(
                          siteToDelete.url.startsWith("http")
                            ? siteToDelete.url
                            : `https://${siteToDelete.url}`
                        ).hostname
                      }
                    </span>
                  )}{" "}
                  will be removed from your blocked list and you'll be able to
                  access it again.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unblocking...
                </>
              ) : (
                "Unblock Site"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
