import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const googleAuth = new GoogleAuth({
  credentials: {
    client_id:
      "22887924268-2fi8h5n7h6rb24dmr8uf8a04lm7qfl20.apps.googleusercontent.com",
    client_secret: "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",
  },
  scopes: SCOPES,
});
export async function getSheetData(spreadsheetId, range) {
  const sheets = google.sheets({ version: "v4", auth: googleAuth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values;
}
