import { useState } from "react";

interface ImageData {
  _id: string;
  url: string;
  title?: string;
  extractedData?: {
    name?: string;
    trackingId?: string;
    courier?: string;
    trackingUrl?: string;
  };
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export function useImageTracking() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldError, setFieldError] = useState("");

  const validate = () => {
    if (!query.trim()) {
      setFieldError("Enter your name or phone number");
      return false;
    }
    setFieldError("");
    return true;
  };

  const fetchImages = async (page = 1) => {
    if (!validate()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "9",
        search: query.trim()
      });
      const res = await fetch(`/api/public/images?${params}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.data.images);
        setPagination(data.data.pagination);
        setCurrentPage(page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery("");
    setImages([]);
    setSearched(false);
    setPagination(null);
    setFieldError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(1);
  };

  return {
    query,
    setQuery,
    images,
    loading,
    searched,
    pagination,
    currentPage,
    fieldError,
    setFieldError,
    fetchImages,
    reset,
    handleSubmit
  };
}