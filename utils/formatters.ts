import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Helper function to validate and parse dates
const parseDate = (date: Date | string | null | undefined): Date | null => {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date value:', date);
    return null;
  }
  
  return dateObj;
};

export const formatDate = (date: Date | string | null | undefined): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return 'Date invalide';
  
  try {
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

export const formatDateTime = (date: Date | string | null | undefined): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return 'Date invalide';
  
  try {
    return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Date invalide';
  }
};

export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return 'Date inconnue';
  
  try {
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Date inconnue';
  }
};

export const formatDuration = (days: number): string => {
  if (days === 0) return '0 jour';
  if (days === 1) return '1 jour';
  return `${days} jours`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};