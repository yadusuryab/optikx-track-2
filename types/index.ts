// types/index.ts
export interface User {
  _id?: string;
  username: string;
  password: string;
  createdAt?: Date;
}

export interface ExtractedData {
  city: any;
  district: any;
  state: any;
  pincode: any;
  trackingId: any;
  name?: string;
  phoneNumber?: string;
  address?: string;
  otherText?: string;
  rawText: string;
}

export interface Image {
  rawText(rawText: any): unknown;
  _id?: string;
  title: string;
  description: string;
  publicId: string;
  url: string;
  extractedData: ExtractedData;
  tags: string[];
  uploadedBy: string;
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T > {
  success: boolean;
  data?: T;
  message?: string;
}