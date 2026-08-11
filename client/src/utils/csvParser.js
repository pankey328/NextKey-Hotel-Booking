import Papa from "papaparse";

// Parses raw CSV text into a JSON array of row objects using PapaParse.
export const parseCsvText = (csvText) => {
  if (!csvText || !csvText.trim()) return [];

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(), 
    transform: (value) => value.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    console.warn("CSV Parsing Warnings/Errors:", parsed.errors);
  }

  return parsed.data || [];
};


// Fetches raw CSV text from Google Sheet URL or local file object,
// then returns the parsed JSON array of row objects.
export const fetchCsvContent = async (sourceType, sheetUrl, selectedFile) => {
  if (sourceType === "link") {
    if (!sheetUrl || !sheetUrl.trim()) {
      throw new Error("Please enter a valid Google Sheets URL.");
    }
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error("Invalid Google Sheets link. URL must contain /d/ID/");
    }
    const sheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(
        "Failed to fetch Google Sheet. Make sure sheet is public ('Anyone with the link can view').",
      );
    }
    return await response.text();
  }

  if (sourceType === "file") {
    if (!selectedFile) {
      throw new Error("Please select a CSV file to upload.");
    }
    return await selectedFile.text();
  }

  throw new Error("Invalid import source specified.");
};
