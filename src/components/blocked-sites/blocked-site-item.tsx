import { Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
}

export function BlockedSiteItem({ site, onEdit, onDelete }: BlockedSiteItemProps) {
  const domain = new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname.replace('www.', '');
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate">
          {domain}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground/70 hover:text-foreground"
            onClick={() => onEdit(site)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive/70 hover:text-destructive"
            onClick={() => onDelete(site)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Added {format(new Date(site.createdAt), 'MMM d, yyyy')}
        </div>
        {site.reason && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {site.reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
