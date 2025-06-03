import { useState, useEffect } from "react";
import { db, BlockedSite } from "@/db/blocked-sites-db";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BlockedSitesForm } from "./blocked-sites-form";
import { BlockedSiteItem } from "./blocked-site-item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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



export function BlockedSites() {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<BlockedSite | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<BlockedSite | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sites = await db.blockedSites.orderBy('createdAt').reverse().toArray();
      setBlockedSites(sites);
      setLoading(false);
    })();
  }, []);

  const filteredSites = blockedSites.filter((site) =>
    site.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSite = async (data: { url: string }) => {
    const newSite: BlockedSite = {
      id: crypto.randomUUID(),
      url: data.url,
      createdAt: new Date().toISOString(),
    };
    await db.blockedSites.add(newSite);
    setBlockedSites(await db.blockedSites.orderBy('createdAt').reverse().toArray());
    toast("Site blocked", {
      description: `${
        new URL(data.url.startsWith("http") ? data.url : `https://${data.url}`)
          .hostname
      } has been added to your blocked list.`,
    });
    setIsFormOpen(false);
  };

  const handleUpdateSite = async (data: { url: string }) => {
    if (!editingSite) return;
    await db.blockedSites.update(editingSite.id, { url: data.url });
    setBlockedSites(await db.blockedSites.orderBy('createdAt').reverse().toArray());
    toast("Site updated", {
      description: "The blocked site has been updated.",
    });
    setEditingSite(null);
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;
    await db.blockedSites.delete(siteToDelete.id);
    setBlockedSites(await db.blockedSites.orderBy('createdAt').reverse().toArray());
    setSiteToDelete(null);
    toast("Site unblocked", {
      description: `${
        new URL(
          siteToDelete.url.startsWith("http")
            ? siteToDelete.url
            : `https://${siteToDelete.url}`
        ).hostname
      } has been removed from your blocked list.`,
    });
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
      <div className="flex items-center justify-between p-4 border-b">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search blocked sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Button
          onClick={() => {
            setEditingSite(null);
            setIsFormOpen(true);
          }}
          className="ml-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="M9.5 9h5" />
                <path d="M12 12v5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">
              {searchTerm ? "No matching sites found" : "No sites blocked yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm
                ? "Try a different search term"
                : "Start by adding a site to block"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first site
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site) => (
              <BlockedSiteItem
                key={site.id}
                site={site}
                onEdit={(site) => {
                  setEditingSite(site);
                  setIsFormOpen(true);
                }}
                onDelete={setSiteToDelete}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSite ? "Edit Blocked Site" : "Add Site to Block"}
            </DialogTitle>
          </DialogHeader>
          <BlockedSitesForm
            defaultValues={editingSite || undefined}
            onSubmit={editingSite ? handleUpdateSite : handleAddSite}
            onCancel={() => {
              setEditingSite(null);
              setIsFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!siteToDelete}
        onOpenChange={(open) => !open && setSiteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unblock{" "}
              {siteToDelete
                ? new URL(
                    siteToDelete.url.startsWith("http")
                      ? siteToDelete.url
                      : `https://${siteToDelete.url}`
                  ).hostname
                : "this site"}{" "}
              and allow access to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Unblock Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
