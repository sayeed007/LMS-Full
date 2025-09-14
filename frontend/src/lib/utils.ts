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
  
  return initials || "NA"; // Fallback if name is empty
}


export const monthDateYearFormat = (date: string): string => {
  return moment(date).format("MMM DD, YYYY");
};
