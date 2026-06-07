'use client';

import { useEffect, useState } from 'react';
import { Image } from '../../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Upload, Trash2, User, Phone, MapPin,
  AlertCircle, Eye, X, Package, Navigation,
  Building, Hash, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ImagesPage() {
  const [images, setImages]           = useState<Image[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res  = await fetch('/api/admin/images');
      const data = await res.json();
      if (data.success) setImages(data.data);
    } catch (e) {
      console.error('Failed to fetch images:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      const res  = await fetch(`/api/admin/images?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.filter(img => img._id !== id));
        if (previewImage?._id === id) setPreviewImage(null);
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setDeleteLoading(null);
      setConfirmDelete(null);
    }
  };

  const filtered = images.filter(img =>
    img.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.extractedData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.extractedData?.phoneNumber?.includes(searchTerm) ||
    img.extractedData?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.extractedData?.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.extractedData?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.extractedData?.pincode?.includes(searchTerm) ||
    img.extractedData?.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Prev/next in preview
  const previewIndex = previewImage ? filtered.findIndex(i => i._id === previewImage._id) : -1;
  const goPrev = () => previewIndex > 0 && setPreviewImage(filtered[previewIndex - 1]);
  const goNext = () => previewIndex < filtered.length - 1 && setPreviewImage(filtered[previewIndex + 1]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <Skeleton className="h-44 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} of {images.length} package{images.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        <Button asChild size="sm">
          <a href="/admin/upload">
            <Upload className="h-4 w-4 mr-2" /> Upload
          </a>
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, phone, city, tracking ID..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">
            {searchTerm ? 'No results found' : 'No packages yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {searchTerm ? 'Try a different search term.' : 'Upload package images to get started.'}
          </p>
          {!searchTerm && (
            <Button asChild size="sm" className="mt-2">
              <a href="/admin/upload"><Upload className="h-4 w-4 mr-2" />Upload Now</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((image: any) => {
            const ed = image.extractedData || {};
            return (
              <div key={image._id}
                className="group rounded-2xl border border-border bg-background overflow-hidden hover:shadow-md transition-all">

                {/* Image */}
                <div className="relative h-44 bg-muted/30 cursor-pointer overflow-hidden"
                  onClick={() => setPreviewImage(image)}>
                  <img src={image.url} alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {ed.trackingId && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm">
                        <Hash className="h-2.5 w-2.5 mr-1" />{ed.trackingId}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  {/* Name */}
                  <div>
                    <p className="font-semibold text-foreground truncate">
                      {ed.name || image.title || 'Unknown'}
                    </p>
                    {ed.phoneNumber && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {ed.phoneNumber}
                        {ed.alternatePhone && <span className="text-xs">/ {ed.alternatePhone}</span>}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  {(ed.city || ed.district || ed.state) && (
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span className="truncate">
                        {[ed.city, ed.district, ed.state].filter(Boolean).join(', ')}
                        {ed.pincode && <span className="ml-1 text-xs">– {ed.pincode}</span>}
                      </span>
                    </div>
                  )}

                  {/* Courier */}
                  {ed.courier && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Package className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{ed.courier}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(image.createdAt)}
                    </span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                        onClick={() => setPreviewImage(image)}>
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirmDelete(image._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Delete package?</p>
                <p className="text-sm text-muted-foreground">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1"
                disabled={deleteLoading === confirmDelete}
                onClick={() => handleDelete(confirmDelete)}>
                {deleteLoading === confirmDelete ? (
                  <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Deleting...</>
                ) : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewImage && (() => {
        const ed = previewImage.extractedData || {};
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}>
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{ed.name || previewImage.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(previewImage.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Prev/Next */}
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={goPrev} disabled={previewIndex <= 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {previewIndex + 1} / {filtered.length}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={goNext} disabled={previewIndex >= filtered.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1"
                    onClick={() => setPreviewImage(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                {/* Image side */}
                <div className="bg-muted/30 flex items-center justify-center min-h-[280px] p-4">
                  <img src={previewImage.url} alt={previewImage.title}
                    className="max-h-[400px] max-w-full object-contain rounded-lg" />
                </div>

                {/* Details side */}
                <div className="p-5 space-y-4">

                  {/* Recipient */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipient</p>
                    {ed.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{ed.name}</span>
                      </div>
                    )}
                    {ed.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${ed.phoneNumber}`}
                          className="text-primary hover:underline">{ed.phoneNumber}</a>
                        {ed.alternatePhone && (
                          <a href={`tel:${ed.alternatePhone}`}
                            className="text-primary hover:underline text-sm">/ {ed.alternatePhone}</a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {(ed.address || ed.landmark || ed.city) && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                      {ed.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span>{ed.address}</span>
                        </div>
                      )}
                      {ed.landmark && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Navigation className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{ed.landmark}</span>
                        </div>
                      )}
                      {(ed.city || ed.district || ed.state || ed.pincode) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>
                            {[ed.city, ed.district, ed.state].filter(Boolean).join(', ')}
                            {ed.pincode && ` – ${ed.pincode}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Courier / Tracking */}
                  {(ed.trackingId || ed.courier) && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shipment</p>
                      {ed.courier && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{ed.courier}</span>
                        </div>
                      )}
                      {ed.trackingId && (
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{ed.trackingId}</span>
                          {ed.trackingUrl && (
                            <a href={ed.trackingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-0.5 text-xs">
                              Track <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={previewImage.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Full Size
                      </a>
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1"
                      onClick={() => { setPreviewImage(null); setConfirmDelete(previewImage._id); }}
                      disabled={deleteLoading === previewImage._id}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}