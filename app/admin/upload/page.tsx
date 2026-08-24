'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, X, ChevronLeft, ChevronRight, Check,
  AlertCircle, CloudUpload, RefreshCw, Camera, Image as ImageIcon
} from 'lucide-react';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  uploading: boolean;
  success?: boolean;
  error?: string;
  errorAction?: string;
  extractedName?: string;
}

function classifyError(message: string): { error: string; errorAction: string } {
  const m = message.toLowerCase();
  if (m.includes('database') || m.includes('mongo'))
    return { error: 'Server database error', errorAction: 'Try again in a few seconds.' };
  if (m.includes('cloud') || m.includes('cloudinary'))
    return { error: 'Cloud storage upload failed', errorAction: 'Check your connection and try again.' };
  if (m.includes('too large') || m.includes('size'))
    return { error: 'Image too large', errorAction: 'Use a photo under 10MB.' };
  if (m.includes('file must be') || m.includes('invalid file'))
    return { error: 'Invalid file type', errorAction: 'Only JPG, PNG, WEBP supported.' };
  if (m.includes('network') || m.includes('fetch'))
    return { error: 'Network error', errorAction: 'Check your connection and try again.' };
  if (m.includes('timeout'))
    return { error: 'Upload timed out', errorAction: 'Try uploading fewer files at once.' };
  return { error: 'Upload failed', errorAction: 'Try again or contact the developer.' };
}

export default function UploadPage() {
  const [uploadItems, setUploadItems]   = useState<UploadItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]           = useState(false);
  const [globalError, setGlobalError]   = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [showPreview, setShowPreview]   = useState(false);
  const [done, setDone]                 = useState(false);
  const [replacingId, setReplacingId]   = useState<string | null>(null);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetAll = () => {
    setUploadItems([]);
    setCurrentIndex(0);
    setDone(false);
    setSuccessCount(0);
    setGlobalError('');
  };

  const addFiles = (files: File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: false,
    }));
    setUploadItems(prev => [...prev, ...newItems]);
    setGlobalError('');
    setDone(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (currentIndex >= next.length) setCurrentIndex(Math.max(0, next.length - 1));
      if (next.length === 0) setShowPreview(false);
      return next;
    });
  };

  const replaceItemWithFile   = (id: string) => { setReplacingId(id); replaceInputRef.current?.click(); };
  const replaceItemWithCamera = (id: string) => { setReplacingId(id); cameraInputRef.current?.click(); };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;
    setUploadItems(prev => prev.map(i =>
      i.id === replacingId
        ? { ...i, file, previewUrl: URL.createObjectURL(file), uploading: false, success: false, error: undefined, errorAction: undefined, extractedName: undefined }
        : i
    ));
    setReplacingId(null);
    e.target.value = '';
  };

  const uploadSingleItem = async (item: UploadItem): Promise<{
    success: boolean; error?: string; errorAction?: string; extractedName?: string;
  }> => {
    try {
      const form = new FormData();
      form.append('image', item.file);
      form.append('title', item.file.name.replace(/\.[^/.]+$/, ''));
      form.append('tags', 'package,dtdc');
      const res  = await fetch('/api/admin/images/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) return { success: true, extractedName: data.data?.name || '' };
      const { error, errorAction } = classifyError(data.message || '');
      return { success: false, error, errorAction };
    } catch (err: any) {
      const { error, errorAction } = classifyError(err.message || 'network error');
      return { success: false, error, errorAction };
    }
  };

  const retryItem = async (item: UploadItem) => {
    setUploadItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, uploading: true, error: undefined, errorAction: undefined, success: false } : i
    ));
    const result = await uploadSingleItem(item);
    setUploadItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, uploading: false, ...result } : i
    ));
    if (result.success) setSuccessCount(c => c + 1);
  };

  const retryFailed = async () => {
    setLoading(true);
    await Promise.all(uploadItems.filter(i => i.error).map(retryItem));
    setLoading(false);
  };

  const handleBulkUpload = async () => {
    if (!uploadItems.length) return;
    setLoading(true);
    setGlobalError('');
    setSuccessCount(0);

    const results = await Promise.all(
      uploadItems.map(async item => {
        setUploadItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, uploading: true, error: undefined, success: false } : i
        ));
        const result = await uploadSingleItem(item);
        setUploadItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, uploading: false, ...result } : i
        ));
        if (result.success) setSuccessCount(c => c + 1);
        return result;
      })
    );

    const ok = results.filter(r => r.success).length;
    setLoading(false);
    setDone(true);

    if (ok < uploadItems.length) {
      setGlobalError(
        ok > 0
          ? `${ok} of ${uploadItems.length} uploaded. ${uploadItems.length - ok} failed.`
          : 'All uploads failed. Check your connection or contact the developer.'
      );
    }
  };

  const allDone     = done && successCount === uploadItems.length && uploadItems.length > 0;
  const current      = uploadItems[currentIndex];
  const failedCount  = uploadItems.filter(i => i.error).length;
  const hasFiles     = uploadItems.length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/30">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <h1 className="text-xl font-bold tracking-tight">Upload Images</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Package label photos</p>
      </div>

      <div className="flex-1 px-4 pb-32 overflow-y-auto space-y-4">

        {/* Empty state: big camera + gallery buttons, no drag-and-drop (mobile has no drag) */}
        {!hasFiles && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            <label
              htmlFor="camera-input"
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer"
            >
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-sm font-semibold text-foreground">Take Photo</span>
            </label>
            <label
              htmlFor="gallery-input"
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed border-border bg-background active:bg-muted transition-colors cursor-pointer"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Choose Photos</span>
            </label>
            <input id="camera-input" type="file" accept="image/*" capture="environment" multiple onChange={handleFileSelect} className="hidden" />
            <input id="gallery-input" type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            <p className="col-span-2 text-xs text-muted-foreground text-center pt-2">
              Make sure name, phone & address are clearly visible
            </p>
          </div>
        )}

        {/* Success state */}
        {allDone && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-5 py-8 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {successCount} Package{successCount !== 1 ? 's' : ''} Uploaded!
            </h2>
            <div className="text-left space-y-2 mt-2 max-h-48 overflow-y-auto">
              {uploadItems.filter(i => i.success).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 bg-background rounded-xl p-2">
                  <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{item.extractedName || `Package ${idx + 1}`}</p>
                  </div>
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File status row */}
        {hasFiles && !allDone && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{uploadItems.length} file{uploadItems.length !== 1 ? 's' : ''}</Badge>
              {done && successCount > 0 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> {successCount}
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {failedCount}
                </span>
              )}
            </div>
            <button onClick={resetAll} className="text-xs text-destructive font-medium px-2 py-1">Clear all</button>
          </div>
        )}

        {/* Thumbnail grid - large tap targets, no hover-only affordances */}
        {hasFiles && !allDone && (
          <div className="grid grid-cols-3 gap-2">
            {uploadItems.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setCurrentIndex(i); setShowPreview(true); }}
                className={[
                  'relative aspect-square rounded-xl border-2 overflow-hidden',
                  item.error ? 'border-destructive' : item.success ? 'border-green-500' : 'border-border',
                ].join(' ')}
              >
                <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                {item.uploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {item.success && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {item.error && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                    <AlertCircle className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  role="button"
                  onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                  className="absolute bottom-1 right-1 h-6 w-6 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
            {/* add more tile */}
            <label
              htmlFor="gallery-input-more"
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center active:bg-muted"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <input id="gallery-input-more" type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        )}

        {/* Global error */}
        {globalError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <p className="text-sm font-medium text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {globalError}
            </p>
            {failedCount > 0 && (
              <Button size="sm" variant="outline" className="h-8 text-xs border-destructive/40 text-destructive w-full"
                onClick={retryFailed} disabled={loading}>
                <RefreshCw className="h-3 w-3 mr-1" /> Retry {failedCount} failed
              </Button>
            )}
          </div>
        )}

        {/* Progress */}
        {loading && (
          <div className="space-y-1.5">
            <Progress value={(successCount / uploadItems.length) * 100} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">{successCount} of {uploadItems.length} uploaded...</p>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar — thumb-reachable */}
      <div className="fixed bottom-0 inset-x-0 bg-background border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
        {allDone ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12 font-semibold" onClick={resetAll}>
              <CloudUpload className="h-4 w-4 mr-2" /> Upload More
            </Button>
            <Button className="flex-1 h-12 font-semibold" onClick={() => router.push('/admin/images')}>
              Done
            </Button>
          </div>
        ) : hasFiles ? (
          <Button onClick={handleBulkUpload} disabled={loading} size="lg" className="w-full h-12 font-semibold">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />Uploading...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Upload {uploadItems.length} File{uploadItems.length !== 1 ? 's' : ''}</>
            )}
          </Button>
        ) : null}
      </div>

      {/* Hidden inputs for replace flow */}
      <input ref={replaceInputRef} type="file" accept="image/*" onChange={handleReplaceFile} className="hidden" />
      <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment" onChange={handleReplaceFile} className="hidden" />

      {/* Preview — full-screen bottom sheet on mobile */}
      {showPreview && current && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={() => setShowPreview(false)} className="p-2 -ml-2">
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm text-muted-foreground">{currentIndex + 1} / {uploadItems.length}</p>
            <div className="w-9" />
          </div>

          <div className="flex-1 flex items-center justify-center bg-muted/30 relative">
            <img src={current.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            {currentIndex > 0 && (
              <button onClick={() => setCurrentIndex(p => p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 rounded-full flex items-center justify-center shadow">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {currentIndex < uploadItems.length - 1 && (
              <button onClick={() => setCurrentIndex(p => p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 rounded-full flex items-center justify-center shadow">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border space-y-3">
            {current.error ? (
              <>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-medium text-destructive">{current.error}</p>
                  {current.errorAction && <p className="text-xs text-muted-foreground mt-1">{current.errorAction}</p>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => retryItem(current)} disabled={current.uploading}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border active:border-primary">
                    <RefreshCw className={`h-5 w-5 text-primary ${current.uploading ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-medium">Retry</span>
                  </button>
                  <button onClick={() => replaceItemWithFile(current.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border active:border-blue-500">
                    <Upload className="h-5 w-5 text-blue-500" />
                    <span className="text-xs font-medium">Replace</span>
                  </button>
                  <button onClick={() => replaceItemWithCamera(current.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border active:border-green-500">
                    <Camera className="h-5 w-5 text-green-500" />
                    <span className="text-xs font-medium">Camera</span>
                  </button>
                </div>
                <button onClick={() => removeItem(current.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-destructive rounded-lg">
                  <X className="h-4 w-4" /> Remove this file
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between">
                {current.success && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Uploaded</Badge>}
                {current.uploading && <Badge variant="secondary" className="animate-pulse">Uploading...</Badge>}
                {!current.success && !current.uploading && <span />}
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(current.id)}>
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}