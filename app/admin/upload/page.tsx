'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload, X, ChevronLeft, ChevronRight, Check,
  AlertCircle, Info, CloudUpload, RefreshCw, Camera
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
    return { error: 'Server database error', errorAction: 'Try again in a few seconds. If it persists, contact the developer.' };
  if (m.includes('cloud') || m.includes('cloudinary'))
    return { error: 'Cloud storage upload failed', errorAction: 'Check your internet connection and try again.' };
  if (m.includes('too large') || m.includes('size'))
    return { error: 'Image is too large', errorAction: 'Use a photo under 10MB or reduce image quality before uploading.' };
  if (m.includes('file must be') || m.includes('invalid file'))
    return { error: 'Invalid file type', errorAction: 'Only JPG, PNG, and WEBP images are supported.' };
  if (m.includes('network') || m.includes('fetch'))
    return { error: 'Network error', errorAction: 'Check your internet connection and try again.' };
  if (m.includes('timeout'))
    return { error: 'Upload timed out', errorAction: 'Your connection may be slow. Try uploading fewer files at once.' };
  return { error: 'Upload failed', errorAction: 'Try again. If the problem continues, contact the developer.' };
}

export default function UploadPage() {
  const [uploadItems, setUploadItems]       = useState<UploadItem[]>([]);
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [loading, setLoading]               = useState(false);
  const [globalError, setGlobalError]       = useState('');
  const [successCount, setSuccessCount]     = useState(0);
  const [isDragging, setIsDragging]         = useState(false);
  const [showPreview, setShowPreview]       = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [done, setDone]                     = useState(false);
  const [replacingId, setReplacingId]       = useState<string | null>(null);

  const fileInputRef    = useRef<HTMLInputElement>(null);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) addFiles(files);
  }, []);

  const removeItem = (id: string) => {
    setUploadItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (currentIndex >= next.length) setCurrentIndex(Math.max(0, next.length - 1));
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
    if (replaceInputRef.current) replaceInputRef.current.value = '';
    if (cameraInputRef.current)  cameraInputRef.current.value  = '';
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
          ? `${ok} of ${uploadItems.length} uploaded. ${uploadItems.length - ok} failed — tap red thumbnails for details.`
          : 'All uploads failed. Check your connection or contact the developer.'
      );
    }
    // if all ok — done=true triggers the two-button UI below, no modal
  };

  const allDone  = done && successCount === uploadItems.length && uploadItems.length > 0;
  const current  = uploadItems[currentIndex];
  const failedCount = uploadItems.filter(i => i.error).length;

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-lg space-y-4">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Upload Images</h1>
          <p className="text-sm text-muted-foreground">Drag & drop or browse to add package images</p>
        </div>

        {/* Drop Zone — hide after all done */}
        {!allDone && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={[
              'relative border-2 border-dashed rounded-2xl transition-all cursor-pointer bg-background',
              isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50',
            ].join(' ')}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
              <div className={[
                'h-16 w-16 rounded-2xl flex items-center justify-center transition-colors',
                isDragging ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
              ].join(' ')}>
                <CloudUpload className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Drop images here</p>
                <p className="text-sm text-muted-foreground mt-0.5">or <span className="text-primary underline underline-offset-2">browse files</span></p>
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP supported</p>
            </div>
          </div>
        )}

        {/* ── All uploaded — success state ── */}
        {allDone && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-8 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
              <Check className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {successCount} Package{successCount !== 1 ? 's' : ''} Uploaded!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">All images processed and saved successfully</p>
            </div>
            {/* Uploaded name list */}
            <div className="text-left space-y-2 mt-2 max-h-36 overflow-y-auto">
              {uploadItems.filter(i => i.success).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.extractedName || `Package ${idx + 1}`}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.file.name}</p>
                  </div>
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File count + actions */}
        {uploadItems.length > 0 && !allDone && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{uploadItems.length} file{uploadItems.length !== 1 ? 's' : ''}</Badge>
              {done && successCount > 0 && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> {successCount} uploaded
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {failedCount} failed
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setShowPreview(true); setCurrentIndex(0); }}>Preview</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={resetAll}>Clear</Button>
            </div>
          </div>
        )}

        {/* Thumbnail strip */}
        {uploadItems.length > 0 && !allDone && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {uploadItems.map((item, i) => (
              <div key={item.id}
                className={[
                  'relative flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden group cursor-pointer',
                  item.error ? 'border-destructive' : item.success ? 'border-green-500' : 'border-border',
                ].join(' ')}
                onClick={() => { setCurrentIndex(i); setShowPreview(true); }}>
                <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                {item.uploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {item.success && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                )}
                {item.error && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                )}
                <button type="button"
                  onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full hidden group-hover:flex items-center justify-center z-10">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Global error */}
        {globalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">{globalError}</p>
              {failedCount > 0 && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>• Tap a red thumbnail to see what went wrong</p>
                  <p>• Fix the issue and retry, or remove the failed files</p>
                </div>
              )}
              {failedCount > 0 && (
                <Button size="sm" variant="outline" className="mt-3 h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={retryFailed} disabled={loading}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry {failedCount} failed
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {loading && (
          <div className="space-y-1.5">
            <Progress value={(successCount / uploadItems.length) * 100} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">{successCount} of {uploadItems.length} uploaded...</p>
          </div>
        )}

        {/* ── CTA Buttons ── */}
        {allDone ? (
          <div className="space-y-2">
            <Button className="w-full h-12 font-semibold" onClick={resetAll}>
              <CloudUpload className="h-4 w-4 mr-2" /> Upload New Files
            </Button>
            <Button variant="outline" className="w-full h-12 font-semibold" onClick={() => router.push('/admin/images')}>
              Go to Home
            </Button>
          </div>
        ) : (
          <Button
            onClick={uploadItems.length ? handleBulkUpload : () => fileInputRef.current?.click()}
            disabled={loading}
            size="lg"
            className="w-full h-12 font-semibold"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />Uploading...</>
            ) : uploadItems.length ? (
              <><Upload className="h-4 w-4 mr-2" />Upload {uploadItems.length} File{uploadItems.length !== 1 ? 's' : ''}</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Select Files</>
            )}
          </Button>
        )}

        {/* Guidelines */}
        {!allDone && (
          <>
            <button type="button" onClick={() => setShowGuidelines(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
              <Info className="h-3.5 w-3.5" /> Upload guidelines
            </button>
            {showGuidelines && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm text-muted-foreground">
                {[
                  'Ensure name, phone, and address on package are clearly visible',
                  'Text extraction happens automatically during upload',
                  'Contact developer if you encounter any issues',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-primary mt-0.5">{i + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden inputs */}
      <input ref={replaceInputRef} type="file" accept="image/*" onChange={handleReplaceFile} className="hidden" />
      <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment" onChange={handleReplaceFile} className="hidden" />

      {/* ── Preview Modal ── */}
      {showPreview && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="font-semibold text-foreground truncate max-w-[280px]">{current.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentIndex + 1} / {uploadItems.length} ·{' '}
                  {current.file.size > 1024 * 1024
                    ? `${(current.file.size / 1024 / 1024).toFixed(1)} MB`
                    : `${(current.file.size / 1024).toFixed(0)} KB`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentIndex(p => Math.min(p + 1, uploadItems.length - 1))} disabled={currentIndex === uploadItems.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 flex items-center justify-center h-[360px] p-4">
              <img src={current.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
            </div>

            {current.error && (
              <div className="mx-5 mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {current.error}
                </div>
                {current.errorAction && (
                  <p className="text-sm text-muted-foreground pl-6">{current.errorAction}</p>
                )}
              </div>
            )}

            <div className="px-5 py-4 border-t border-border mt-3">
              {current.error ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center">What would you like to do with this file?</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => retryItem(current)} disabled={current.uploading}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                        <RefreshCw className={`h-4 w-4 text-primary ${current.uploading ? 'animate-spin' : ''}`} />
                      </div>
                      <span className="text-xs font-medium">{current.uploading ? 'Retrying...' : 'Retry'}</span>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">Try uploading again</span>
                    </button>
                    <button onClick={() => replaceItemWithFile(current.id)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                      <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                        <Upload className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xs font-medium">Replace</span>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">Choose another file</span>
                    </button>
                    <button onClick={() => replaceItemWithCamera(current.id)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/5 transition-all group">
                      <div className="h-9 w-9 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20">
                        <Camera className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-xs font-medium">Camera</span>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">Retake the photo</span>
                    </button>
                  </div>
                  <button onClick={() => { removeItem(current.id); if (uploadItems.length <= 1) setShowPreview(false); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-destructive hover:bg-destructive/5 rounded-lg transition-colors">
                    <X className="h-3.5 w-3.5" /> Remove this file
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {current.success   && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Uploaded</Badge>}
                    {current.uploading && <Badge variant="secondary" className="animate-pulse">Uploading...</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { removeItem(current.id); if (uploadItems.length <= 1) setShowPreview(false); }}>
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}