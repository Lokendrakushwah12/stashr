"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseBookmarkFile, useBulkExport, useBulkImport, type BulkImportData } from '@/lib/hooks/use-bulk-operations';
import { FileCsvIcon, FileHtmlIcon } from "@phosphor-icons/react";
import { CheckCircle, Download, FileJson, FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImportExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folderId?: string; // Optional: if provided, export only this folder's bookmarks
}

const ImportExportDialog = ({ open, onOpenChange, folderId }: ImportExportDialogProps) => {
    const [activeTab, setActiveTab] = useState("import");
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<BulkImportData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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
            toast.success(`File parsed successfully! Found ${data.bookmarks.length} bookmarks.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to parse file');
            setSelectedFile(null);
            setImportPreview(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (!importPreview) return;

        try {
            setIsProcessing(true);
            await bulkImport.mutateAsync(importPreview);
            setSelectedFile(null);
            setImportPreview(null);
            onOpenChange(false);
        } catch {
            // Error is handled by the mutation's onError callback
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async (format: 'json' | 'csv' | 'html') => {
        try {
            await exportBookmarks(format, folderId);
        } catch {
            toast.error('Failed to export bookmarks');
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setImportPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import & Export Bookmarks</DialogTitle>
                    <DialogDescription>
                        Import bookmarks from other services or export your current bookmarks.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="import" className="flex items-center gap-2 px-2 sm:px-3">
                            <Upload className="h-4 w-4" />
                            Import
                        </TabsTrigger>
                        <TabsTrigger value="export" className="flex items-center gap-2 px-2 sm:px-3">
                            <Download className="h-4 w-4" />
                            Export
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="import" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label>Supported Formats</Label>
                                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
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
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,.html,.htm,.csv,.txt"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />

                                {!selectedFile ? (
                                    <div className="space-y-2">
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
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
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Supports JSON, HTML, CSV, and TXT formats
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                                        <p className="text-sm font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {importPreview?.bookmarks?.length ?? 0} bookmarks ready to import
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={removeFile}
                                            className="mt-2"
                                        >
                                            <X className="h-4 w-4 mr-1" />
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
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {importPreview.bookmarks.length} bookmarks ready
                                        </div>
                                    </div>

                                    <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
                                        {importPreview.bookmarks.slice(0, 5).map((bookmark, index: number) => (
                                            <div key={index} className="text-sm p-2 bg-background rounded border">
                                                <div className="font-medium truncate">{bookmark.title}</div>
                                                <div className="text-muted-foreground text-xs truncate">{bookmark.url}</div>
                                            </div>
                                        ))}
                                        {importPreview.bookmarks.length > 5 && (
                                            <div className="text-center text-sm text-muted-foreground py-2">
                                                ... and {importPreview.bookmarks.length - 5} more
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleImport}
                                        disabled={isProcessing || bulkImport.isPending}
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
                        </div>
                    </TabsContent>

                    <TabsContent value="export" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label>Export Options</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {folderId
                                        ? "Export bookmarks from this folder only"
                                        : "Export all your bookmarks"
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('json')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <FileJson className="h-6 w-6" />
                                    <div>
                                        <div className="font-medium">JSON</div>
                                        <div className="text-xs text-muted-foreground">Structured data</div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('csv')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <FileCsvIcon weight="duotone" className="h-6 w-6" />
                                    <div>
                                        <div className="font-medium">CSV</div>
                                        <div className="text-xs text-muted-foreground">Spreadsheet ready</div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('html')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <FileHtmlIcon weight="duotone" className="h-6 w-6" />
                                    <div>
                                        <div className="font-medium">HTML</div>
                                        <div className="text-xs text-muted-foreground">Web page format</div>
                                    </div>
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <p>• JSON: Best for importing into other applications</p>
                                <p>• CSV: Compatible with Excel, Google Sheets, and databases</p>
                                <p>• HTML: Viewable in any web browser</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ImportExportDialog;
