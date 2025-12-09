import React from 'react';

export type AuthRoute = 'login' | 'register' | 'forgot-password';

export type LeadStatus = 'Nuovo' | 'Contattato' | 'In Negoziazione' | 'Vinto' | 'Perso';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  value: number;
  lastContact: string;
  notes: string;
  source?: string;
  createdAt?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | 'system';
  title: string;
  description: string;
  date: string;
  leadId?: string;
}

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  leadId?: string;
  leadName?: string;
  type: 'call' | 'meeting' | 'demo';
  status: 'scheduled' | 'completed' | 'canceled' | 'noshow';
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  htmlLink: string;
}

export interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  positive?: boolean;
  icon: React.ReactNode;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

// --- ONBOARDING TYPES ---

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price?: number;
  selected: boolean;
}

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface AutomationConfig {
  reminder24h: boolean;
  reminder2h: boolean;
  noShowRecovery: boolean;
  channels: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  askReview: boolean;
}

export interface OnboardingData {
  importMethod: 'google' | 'csv' | 'none' | null;
  sector: string;
  subCategory: string;
  services: Service[];
  bufferTime: number;
  calendarSystem: 'google' | 'ical' | 'manual' | null;
  workingDays: string[]; // e.g., ['Mon', 'Tue'...]
  automations: AutomationConfig;
  toneOfVoice: 'professional' | 'friendly' | 'promotional';
  whatsappConsent: boolean;
}