import crypto from "node:crypto";
import { google } from "googleapis";
import {
  collections,
  collectionKeys,
  fallbackContent,
  itemToRow,
  normalizeContent,
  rowToItem,
  sanitizeCollection,
  sortItems,
} from "./content-schema.js";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

export const sheetsConfigured = () =>
  Boolean(spreadsheetId && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

const getSheetsClient = async () => {
  const key = String(process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
};

const sheetTitleFor = (collection) => collections[collection].sheetName;

const getSpreadsheet = async (sheets) =>
  sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });

const ensureSheet = async (sheets, collection) => {
  const title = sheetTitleFor(collection);
  const meta = await getSpreadsheet(sheets);
  const existing = meta.data.sheets?.find((sheet) => sheet.properties?.title === title);

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }

  const header = collections[collection].columns;
  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!1:1`,
  });

  const currentHeader = current.data.values?.[0] || [];
  if (header.some((column, index) => currentHeader[index] !== column)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!1:1`,
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }

  const latestMeta = await getSpreadsheet(sheets);
  return latestMeta.data.sheets?.find((sheet) => sheet.properties?.title === title)?.properties;
};

const readCollection = async (sheets, collection, { sorted = true } = {}) => {
  await ensureSheet(sheets, collection);
  const { columns } = collections[collection];
  const title = sheetTitleFor(collection);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A2:${String.fromCharCode(64 + columns.length)}`,
  });

  const items = (response.data.values || []).map((row) => rowToItem(row, columns)).filter((item) => item.id);
  return sorted ? sortItems(items) : items;
};

export const getContent = async ({ includeInactive = false } = {}) => {
  if (!sheetsConfigured()) {
    return {
      ok: true,
      source: "fallback",
      configured: false,
      content: includeInactive ? fallbackContent : normalizeContent(fallbackContent),
    };
  }

  const sheets = await getSheetsClient();
  const entries = await Promise.all(collectionKeys.map(async (key) => [key, await readCollection(sheets, key)]));
  const content = Object.fromEntries(entries);

  return {
    ok: true,
    source: "google-sheets",
    configured: true,
    content: includeInactive ? content : normalizeContent(content),
  };
};

export const createItem = async (collection, item) => {
  sanitizeCollection(collection);
  if (!sheetsConfigured()) throw new Error("Google Sheets is not configured.");

  const sheets = await getSheetsClient();
  await ensureSheet(sheets, collection);

  const finalItem = {
    ...item,
    id: item.id || crypto.randomUUID(),
    active: item.active ?? true,
    sort: item.sort || Date.now(),
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTitleFor(collection)}!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [itemToRow(finalItem, collections[collection].columns)] },
  });

  return finalItem;
};

export const updateItem = async (collection, id, item) => {
  sanitizeCollection(collection);
  if (!sheetsConfigured()) throw new Error("Google Sheets is not configured.");

  const sheets = await getSheetsClient();
  await ensureSheet(sheets, collection);

  const { columns } = collections[collection];
  const rows = await readCollection(sheets, collection, { sorted: false });
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) throw new Error("Item not found.");

  const nextItem = { ...rows[index], ...item, id };
  const rowNumber = index + 2;
  const lastColumn = String.fromCharCode(64 + columns.length);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitleFor(collection)}!A${rowNumber}:${lastColumn}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [itemToRow(nextItem, columns)] },
  });

  return nextItem;
};

export const deleteItem = async (collection, id) => {
  sanitizeCollection(collection);
  if (!sheetsConfigured()) throw new Error("Google Sheets is not configured.");

  const sheets = await getSheetsClient();
  const sheet = await ensureSheet(sheets, collection);
  const rows = await readCollection(sheets, collection, { sorted: false });
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) throw new Error("Item not found.");

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.sheetId,
              dimension: "ROWS",
              startIndex: index + 1,
              endIndex: index + 2,
            },
          },
        },
      ],
    },
  });

  return { id };
};
