import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compareRoomNumbers(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function sortRooms<T extends { roomNumber: string }>(rooms: T[]): T[] {
  return [...rooms].sort((a, b) => compareRoomNumbers(a.roomNumber, b.roomNumber));
}
