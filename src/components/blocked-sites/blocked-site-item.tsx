import { Clock, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface BlockedSite {
  id: string;
  url: string;
  reason?: string;
  createdAt: string;
}

interface BlockedSiteItemProps {
  site: BlockedSite;
  onEdit: (site: BlockedSite) => void;
  onDelete: (site: BlockedSite) => void;
  isEditing?: boolean;
}

export function BlockedSiteItem({ site, onEdit, onDelete, isEditing = false }: BlockedSiteItemProps) {
  const domain = new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.replace('www.', '');
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  
  return (
    <motion.div
      animate={isEditing ? { scale: 0.98, opacity: 0.8 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.1 }}
      className={cn("h-full", isEditing && "pointer-events-none")}
    >
      <Card className="h-full overflow-hidden transition-all hover:border-primary/20 hover:shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <div className="flex items-center space-x-3 truncate">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              <img 
                src={faviconUrl} 
                alt="" 
                className="h-4 w-4" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden h-6 w-6 items-center justify-center text-xs font-medium text-muted-foreground bg-muted rounded-full">
                {domain[0]?.toUpperCase()}
              </div>
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {domain}
              </CardTitle>
              <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Added {format(new Date(site.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(site);
              }}
              title="Edit site"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(site);
              }}
              title="Delete site"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {site.reason && (
            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {site.reason}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <a
              href={site.url.startsWith('http') ? site.url : `https://${site.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Visit site
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
