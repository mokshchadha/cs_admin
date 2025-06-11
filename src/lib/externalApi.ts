// src/lib/externalApi.ts
import { ExternalApiRequest, ExternalApiResponse } from "./types";

const EXTERNAL_API_URL =
  "https://universityadmission.co.in/api/generate/student-id/universal";
const API_KEY = "718de734-e839-4def-b54f-65a8cd9b7489";

export async function createStudentId(
  data: ExternalApiRequest
): Promise<ExternalApiResponse> {
  try {
    console.log({ data });
    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("External API call failed:", error);
    throw error;
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Add +91 prefix if not present
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+91-${cleaned}`;
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+91-${cleaned.substring(2)}`;
  }

  return `+91-${cleaned}`;
}

export function formatDateOfBirth(createdAt: string): string {
  // Use created date as DOB or generate a default one
  // You might want to adjust this logic based on your requirements
  const date = new Date(createdAt);
  // Set a default age of 25 years for DOB
  date.setFullYear(date.getFullYear() - 25);
  return date.toISOString().split("T")[0];
}
