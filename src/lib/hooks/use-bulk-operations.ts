import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BulkImportResponse {
  success: boolean;
  imported: number;
  errors: number;
  details: {
    imported: Array<{ id: string; title: string; url: string }>;
    errors: Array<{ url: string; error: string }>;
  };
}

export interface BulkImportData {
  bookmarks: Array<{
    title: string;
    url: string;
    description?: string;
    excerpt?: string;
    tags?: string[];
    createdAt?: string;
    folderId?: string;
  }>;
  source?: string;
  folderName?: string; // New field for creating a folder during import
}

export const useBulkImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkImportData): Promise<BulkImportResponse> => {
      const response = await fetch("/api/bookmarks/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error ?? "Failed to import bookmarks");
      }

      return response.json() as Promise<BulkImportResponse>;
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      void queryClient.invalidateQueries({ queryKey: ["folders"] });
      void queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      // Show appropriate messages based on results
      if (data.imported > 0 && data.errors === 0) {
        // All bookmarks imported successfully
        toast.success(`Successfully imported ${data.imported} bookmarks`);
      } else if (data.imported > 0 && data.errors > 0) {
        // Partial success - some imported, some failed
        toast.success(`Imported ${data.imported} bookmarks successfully`);
        toast.warning(`${data.errors} bookmarks failed to import (likely duplicates)`);
      } else if (data.imported === 0 && data.errors > 0) {
        // All bookmarks failed to import
        toast.error(`Failed to import any bookmarks. ${data.errors} bookmarks already exist or have errors.`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkExport = () => {
  const exportBookmarks = async (
    format: "json" | "csv" | "html" = "json",
    folderId?: string,
  ) => {
    const params = new URLSearchParams();
    params.append("format", format);
    if (folderId) {
      params.append("folderId", folderId);
    }

    const response = await fetch(`/api/bookmarks/bulk?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to export bookmarks");
    }

    if (format === "json") {
      return response.json() as Promise<unknown>;
    } else {
      // For HTML and CSV, trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Bookmarks exported as ${format.toUpperCase()}`);
    }
  };

  return { exportBookmarks };
};

// Helper function to parse different bookmark formats
export const parseBookmarkFile = async (
  file: File,
): Promise<BulkImportData> => {
  const text = await file.text();
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith(".json")) {
      const data = JSON.parse(text) as unknown;
      return normalizeBookmarkData(data);
    } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
      return parseHTMLBookmarks(text);
    } else if (fileName.endsWith(".csv")) {
      return parseCSVBookmarks(text);
    } else if (fileName.endsWith(".txt")) {
      return parseTXTBookmarks(text);
    } else {
      throw new Error(
        "Unsupported file format. Please use JSON, HTML, CSV, or TXT files.",
      );
    }
  } catch (error) {
    throw new Error(
      `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Normalize bookmark data from various sources
const normalizeBookmarkData = (data: unknown): BulkImportData => {
  // Handle different export formats
  if (
    data &&
    typeof data === "object" &&
    "bookmarks" in data &&
    Array.isArray((data as Record<string, unknown>).bookmarks)
  ) {
    const bookmarksData = (data as Record<string, unknown>).bookmarks as unknown[];
    return {
      bookmarks: bookmarksData.map((b: unknown) => {
        if (b && typeof b === "object") {
          const bookmark = b as Record<string, unknown>;
          return {
            title: (bookmark.title ?? bookmark.name ?? "Untitled") as string,
            url: (bookmark.url ??
              bookmark.link ??
              bookmark.href ??
              "") as string,
            description: (bookmark.description ??
              bookmark.excerpt ??
              bookmark.summary ??
              "") as string,
            tags: (bookmark.tags ?? bookmark.categories ?? []) as string[],
            createdAt: (bookmark.createdAt ??
              bookmark.dateAdded ??
              bookmark.added ??
              "") as string,
            folderId: (bookmark.folderId ??
              bookmark.folder ??
              bookmark.collection ??
              "") as string,
          };
        }
        return {
          title: "Untitled",
          url: "",
          description: "",
          tags: [],
          createdAt: "",
          folderId: "",
        };
      }),
      source: ((data as Record<string, unknown>).source ?? "JSON Import") as string,
    };
  }

  // Handle array of bookmarks directly
  if (Array.isArray(data)) {
    return {
      bookmarks: data.map((b: unknown) => {
        if (b && typeof b === "object") {
          const bookmark = b as Record<string, unknown>;
          return {
            title: (bookmark.title ?? bookmark.name ?? "Untitled") as string,
            url: (bookmark.url ??
              bookmark.link ??
              bookmark.href ??
              "") as string,
            description: (bookmark.description ??
              bookmark.excerpt ??
              bookmark.summary ??
              "") as string,
            tags: (bookmark.tags ?? bookmark.categories ?? []) as string[],
            createdAt: (bookmark.createdAt ??
              bookmark.dateAdded ??
              bookmark.added ??
              "") as string,
            folderId: (bookmark.folderId ??
              bookmark.folder ??
              bookmark.collection ??
              "") as string,
          };
        }
        return {
          title: "Untitled",
          url: "",
          description: "",
          tags: [],
          createdAt: "",
          folderId: "",
        };
      }),
      source: "JSON Import",
    };
  }

  throw new Error("Invalid bookmark data format");
};

// Parse HTML bookmarks (Netscape format, Pocket, etc.)
const parseHTMLBookmarks = (html: string): BulkImportData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const bookmarks: Array<{
    title: string;
    url: string;
    description: string;
    tags: string[];
    createdAt?: string;
  }> = [];
  const links = doc.querySelectorAll("a");

  links.forEach((link) => {
    const title =
      link.textContent?.trim() ?? link.getAttribute("title") ?? "Untitled";
    const url = link.getAttribute("href") ?? "";
    const description =
      link.getAttribute("description") ?? link.getAttribute("summary") ?? "";
    const tags =
      link
        .getAttribute("tags")
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [];
    const dateAdded =
      link.getAttribute("add_date") ?? link.getAttribute("date_added") ?? "";

    if (url?.startsWith("http")) {
      bookmarks.push({
        title,
        url,
        description,
        tags,
        createdAt: dateAdded
          ? new Date(parseInt(dateAdded) * 1000).toISOString()
          : undefined,
      });
    }
  });

  return {
    bookmarks,
    source: "HTML Import",
  };
};

// Parse CSV bookmarks
const parseCSVBookmarks = (csv: string): BulkImportData => {
  const lines = csv.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error(
      "CSV file must have at least a header row and one data row",
    );
  }

  const headers = lines[0]?.split(",")?.map((h) => h.trim().replace(/"/g, ""));
  const bookmarks: Array<{
    title: string;
    url: string;
    description: string;
    tags: string[];
    folderId?: string;
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const bookmark: Record<string, string | string[]> = {};

    if (headers) {
      headers.forEach((header, index) => {
        const value = values[index] ?? "";
        switch (header.toLowerCase()) {
          case "title":
          case "name":
            bookmark.title = value;
            break;
          case "url":
          case "link":
          case "href":
            bookmark.url = value;
            break;
          case "description":
          case "summary":
          case "excerpt":
            bookmark.description = value;
            break;
          case "tags":
          case "categories":
            bookmark.tags = value
              ? value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];
            break;
          case "folder":
          case "collection":
            bookmark.folderId = value;
            break;
        }
      });
    }

    if (bookmark.title && bookmark.url) {
      bookmarks.push({
        title: bookmark.title as string,
        url: bookmark.url as string,
        description: (bookmark.description as string) ?? "",
        tags: (bookmark.tags as string[]) ?? [],
        folderId: bookmark.folderId as string,
      });
    }
  }

  return {
    bookmarks,
    source: "CSV Import",
  };
};

// Parse TXT bookmarks (simple URL list)
const parseTXTBookmarks = (text: string): BulkImportData => {
  const lines = text.split("\n").filter((line) => line.trim());
  const bookmarks: Array<{
    title: string;
    url: string;
    description: string;
    tags: string[];
  }> = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      trimmed &&
      (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    ) {
      bookmarks.push({
        title: new URL(trimmed).hostname,
        url: trimmed,
        description: "",
        tags: [],
      });
    }
  });

  return {
    bookmarks,
    source: "TXT Import",
  };
};
