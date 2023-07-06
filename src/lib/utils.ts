import UserProfile from "@/types/UserProfile"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import ImageObj from "../types/Website/ImageObj"
import Location from "@/types/Locations"

export const DAYS_OF_WEEK: string[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isToday(date: Date) {
  const today = new Date(); // Get the current date

  // Compare the year, month, and day of the two dates
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isTomorrow(date: Date) {
  const today = new Date(); // Get the current date

  // Get the date of tomorrow by adding 1 day to today's date
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Compare the year, month, and day of the two dates
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

export function isEmptyObject(obj: Object) {
  return Object.keys(obj).length === 0;
}

export function getTimeString(date: Date) {

  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);

  // Format the time as a string
  const time = `${hours}:${minutes}`;
  return time;
}

export function dateIsToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function dateIsFuture(date: Date) {
  return date > new Date() && !dateIsToday(date);
}

export function dateIsPast(date: Date) {
  return date < new Date() && !dateIsToday(date);
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  
  return `${day}/${month}/${year}`;
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (word: string) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
}

export function generateTimeIntervals(startTime: string, endTime: string) {
  const timeIntervals = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    const formattedHour = String(currentHour).padStart(2, '0');
    const formattedMinute = String(currentMinute).padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinute}`;

    timeIntervals.push(formattedTime);

    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }

  return timeIntervals;
}

//always uses avif
export const toBlob = (dataURI: string, type:string) => {
  const base64Data = dataURI.split(',')[1];
  // Convert base64 to raw binary data
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }

  // Create Blob from Uint8Array with image MIME type
  const blob = new Blob([new Uint8Array(byteArrays)], { type });
  return blob;
};

export const isBinaryImage = (uri: string) => {
  return uri.startsWith("data:");
}

export const defaultLocalImages: ImageObj = {
  logo: "",
  images: ["", "", "", "", "", ""],
  backgrounds: {
    logoSection: "",
    pickupDeliverySection: "",
    extraParaPic: "",
    connectWithUs: "",
    pickup: "",
    delivery: "",
    contactUs: "",
    sloganSection: "",
  },
}

export const getDeepCopyOfObject = (object:any) => {
  return JSON.parse(JSON.stringify(object));
}

export function truncateComment(str: string) {
  if (str.length > 20) {
    return str.slice(0, 20) + "...";
  }
  return str;
}

//using email as id currently
export function getCustomerNotes(number: string, userProfiles: UserProfile[]){
  const user = userProfiles.find(u => u.id === number);

  return user?.notes ? user.notes : "";
}

//gets from LOCATION (idk bit confusing but fuck it)
export function getRestaurantName(locationId:string, allLocations: Location[]){
  const foundLocation = allLocations.find(l => l.locationId === locationId);

  return foundLocation ? foundLocation.name : "";
}


export function extractFileType(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+)(;base64)?,/);

  if (match && match.length >= 2) {
    return match[1];
  }

  return null;
}

