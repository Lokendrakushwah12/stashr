"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  parseBookmarkFile,
  useBulkExport,
  useBulkImport,
  type BulkImportData,
} from "@/lib/hooks/use-bulk-operations";
import { FileCsvIcon, FileHtmlIcon } from "@phosphor-icons/react";
import {
  CheckSquare,
  Export,
  Upload,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Download, FileJson, FileText, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string; // Optional: if provided, export only this folder's bookmarks
}

const ImportExportDialog = ({
  open,
  onOpenChange,
  folderId,
}: ImportExportDialogProps) => {
  const [activeTab, setActiveTab] = useState("import");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<BulkImportData | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportBookmarks } = useBulkExport();
  const bulkImport = useBulkImport();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      const data = await parseBookmarkFile(file);
      setSelectedFile(file);
      setImportPreview(data);
      setShowFolderInput(true);
      toast.success(
        `File parsed successfully! Found ${data.bookmarks.length} bookmarks.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse file",
      );
      setSelectedFile(null);
      setImportPreview(null);
      setShowFolderInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importPreview || !folderName.trim()) return;

    try {
      setIsProcessing(true);
      // Create import data with folder name
      const importData = {
        ...importPreview,
        folderName: folderName.trim(),
      };
      const result = await bulkImport.mutateAsync(importData);

      // Show detailed results
      if (result.imported > 0) {
        toast.success(
          `Imported ${result.imported} bookmarks into "${folderName.trim()}" folder`,
        );
      }

      if (result.errors > 0) {
        toast.warning(
          `${result.errors} bookmarks were skipped (likely duplicates)`,
        );
      }

      setSelectedFile(null);
      setImportPreview(null);
      setFolderName("");
      setShowFolderInput(false);
      onOpenChange(false);
    } catch {
      // Error is handled by the mutation's onError callback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (format: "json" | "csv" | "html") => {
    try {
      await exportBookmarks(format, folderId);
    } catch {
      toast.error("Failed to export bookmarks");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImportPreview(null);
    setFolderName("");
    setShowFolderInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Import & Export Bookmarks</DialogTitle>
          <DialogDescription>
            Import bookmarks from other services or export your current
            bookmarks.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-background border-border/70 flex h-[calc(60vh+50px)] flex-col rounded-xl border">
          <Tabs
            variant="bordered"
            defaultValue={activeTab}
            onValueChange={(val) => setActiveTab(val)}
            className="flex h-full w-full flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 px-4 py-1">
              <TabsTrigger
                value="import"
                className="flex items-center justify-center gap-2 px-2 sm:px-3"
              >
                <Upload className="h-4 w-4 rotate-180" />
                Import
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="flex items-center justify-center gap-2 px-2 sm:px-3"
              >
                <Upload className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="import"
              className="flex flex-1 flex-col p-4 pt-2 pb-6"
            >
              {/* Scrollable Content Area */}
              <ScrollArea className="max-h-[50vh] min-h-0 flex-1">
                <div className="space-y-4 pr-4 pb-4">
                  <div>
                    <Label>Supported Formats</Label>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <FileJson className="h-3 w-3" />
                        JSON
                      </div>
                      <div className="flex items-center gap-1">
                        <FileHtmlIcon weight="duotone" className="h-3 w-3" />
                        HTML
                      </div>
                      <div className="flex items-center gap-1">
                        <FileCsvIcon weight="duotone" className="h-3 w-3" />
                        CSV
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        TXT
                      </div>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.html,.htm,.csv,.txt"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0])
                      }
                      className="hidden"
                    />

                    {!selectedFile ? (
                      <div className="space-y-2">
                        <Upload className="text-muted-foreground mx-auto h-8 w-8" />
                        <div>
                          <p className="text-sm font-medium">
                            Drop your bookmark file here, or{" "}
                            <button
                              type="button"
                              onClick={openFileDialog}
                              className="text-primary hover:underline"
                            >
                              browse
                            </button>
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Supports JSON, HTML, CSV, and TXT formats. HTML
                            files from browser exports are fully supported.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CheckSquare className="mx-auto h-8 w-8 text-green-400/50" />
                        <p className="text-sm font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {importPreview?.bookmarks?.length ?? 0} bookmarks
                          ready to import
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="mt-2"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Remove File
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Import Preview */}
                  {importPreview && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Import Preview</Label>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-green-500" />
                          {importPreview.bookmarks.length} bookmarks ready
                        </div>
                      </div>

                      <div className="bg-muted/20 max-h-40 w-full space-y-2 overflow-y-auto rounded-lg border p-3">
                        {importPreview.bookmarks
                          .slice(0, 5)
                          .map((bookmark, index: number) => (
                            <div
                              key={index}
                              className="bg-background rounded border p-2 text-sm"
                            >
                              <div className="max-w-lg truncate font-medium text-ellipsis">
                                {bookmark.title}
                              </div>
                              <div className="text-muted-foreground max-w-lg truncate text-xs">
                                {bookmark.url}
                              </div>
                            </div>
                          ))}
                        {importPreview.bookmarks.length > 5 && (
                          <div className="text-muted-foreground py-2 text-center text-sm">
                            ... and {importPreview.bookmarks.length - 5} more
                          </div>
                        )}
                      </div>

                      {/* Folder Name Input */}
                      {showFolderInput && (
                        <div className="space-y-2">
                          <Label htmlFor="folderName">Folder Name</Label>
                          <Input
                            id="folderName"
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="Enter folder name for imported bookmarks"
                            className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                            disabled={isProcessing || bulkImport.isPending}
                          />
                          <p className="text-muted-foreground text-xs">
                            Bookmarks will be imported into a new folder with
                            this name. Duplicate URLs will be automatically
                            skipped.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Sticky Import Button */}
              {importPreview && showFolderInput && (
                <div className="border-border bg-background border-t pt-4">
                  <Button
                    onClick={handleImport}
                    disabled={
                      isProcessing || bulkImport.isPending || !folderName.trim()
                    }
                    className="w-full"
                  >
                    {isProcessing || bulkImport.isPending ? (
                      <>Importing...</>
                    ) : (
                      <>Import {importPreview.bookmarks.length} Bookmarks</>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="export" className="flex-1 p-4 pt-2">
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  <div>
                    <Label>Export Options</Label>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {folderId
                        ? "Export bookmarks from this folder only"
                        : "Export all your bookmarks"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Button
                      variant="outline"
                      onClick={() => handleExport("json")}
                      className="flex h-auto flex-col items-center gap-2 py-4"
                    >
                      <FileJson className="h-6 w-6" />
                      <div>
                        <div className="font-medium">JSON</div>
                        <div className="text-muted-foreground text-xs">
                          Structured data
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleExport("csv")}
                      className="flex h-auto flex-col items-center gap-2 py-4"
                    >
                      <FileCsvIcon weight="duotone" className="h-6 w-6" />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-muted-foreground text-xs">
                          Spreadsheet ready
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleExport("html")}
                      className="flex h-auto flex-col items-center gap-2 py-4"
                    >
                      <FileHtmlIcon weight="duotone" className="h-6 w-6" />
                      <div>
                        <div className="font-medium">HTML</div>
                        <div className="text-muted-foreground text-xs">
                          Web page format
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="text-muted-foreground text-sm">
                    <p>• JSON: Best for importing into other applications</p>
                    <p>
                      • CSV: Compatible with Excel, Google Sheets, and databases
                    </p>
                    <p>• HTML: Viewable in any web browser</p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;
