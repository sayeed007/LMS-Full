import { clsx, type ClassValue } from "clsx"
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getInitials(name: string): string {
  // Split the name by spaces and filter out empty strings
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  // Take the first letter of up to two parts (first and last name)
  const initials = nameParts
    .slice(0, 2) // Limit to first two parts
    .map(part => part.charAt(0).toUpperCase()) // Get first letter and capitalize
    .join("");

  return initials || "N/A"; // Fallback if name is empty
}


export const monthDateYearFormat = (date: string): string => {
  return moment(date).format("MMM DD, YYYY");
};

export const getErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const apiError = error as { data?: { message?: string } };
    if (apiError.data?.message) return apiError.data.message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  return defaultMessage;
}


export const getDateTimeFormat = (date: string): string => {
  return (
    new Date(date || '').toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  )
}
