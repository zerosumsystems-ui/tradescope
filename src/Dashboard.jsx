import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend, ReferenceLine, ComposedChart, Scatter } from "recharts";
import * as db from "./db";

const C = {
  bg: "#000000",
  bgAlt: "#0a0a0a",
  surface: "#111111",
  surfaceRaised: "#1a1a1a",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.12)",
  text: "#f5f5f7",
  textDim: "#a1a1a6",
  textMuted: "#6e6e73",
  accent: "#2997ff",
  accentDim: "#1a5a9e",
  green: "#34c759",
  greenSoft: "rgba(52,199,89,0.1)",
  greenBar: "rgba(52,199,89,0.7)",
  red: "#ff3b30",
  redSoft: "rgba(255,59,48,0.1)",
  redBar: "rgba(255,59,48,0.7)",
  yellow: "#ffcc00",
  orange: "#ff9500",
  purple: "#af52de",
  cyan: "#5ac8fa",
  white: "#ffffff",
};

const SAMPLE_CSV = `Run Date,Account,Action,Symbol,Security Description,Security Type,Quantity,Price ($),Commission ($),Fees ($),Accrued Interest ($),Amount ($),Settlement Date
01/06/2025,Z12345678,YOU BOUGHT,AAPL,APPLE INC,Cash,100,182.50,0,0.06,,,-18250.06,01/08/2025
01/15/2025,Z12345678,YOU SOLD,AAPL,APPLE INC,Cash,-100,195.80,0,0.06,,,19579.94,01/17/2025
01/08/2025,Z12345678,YOU BOUGHT,MSFT,MICROSOFT CORP,Cash,50,390.20,0,0.04,,,-19510.04,01/10/2025
01/17/2025,Z12345678,YOU SOLD,MSFT,MICROSOFT CORP,Cash,-50,402.40,0,0.04,,,20119.96,01/21/2025
01/13/2025,Z12345678,YOU BOUGHT,NVDA,NVIDIA CORP,Cash,80,620.00,0,0.08,,,-49600.08,01/15/2025
01/22/2025,Z12345678,YOU SOLD,NVDA,NVIDIA CORP,Cash,-80,595.30,0,0.08,,,-47624.08,01/24/2025
01/20/2025,Z12345678,YOU BOUGHT,TSLA,TESLA INC,Cash,60,228.10,0,0.05,,,-13686.05,01/22/2025
01/29/2025,Z12345678,YOU SOLD,TSLA,TESLA INC,Cash,-60,252.70,0,0.05,,,15161.95,01/31/2025
01/27/2025,Z12345678,YOU BOUGHT,META,META PLATFORMS INC,Cash,30,478.90,0,0.03,,,-14367.03,01/29/2025
02/04/2025,Z12345678,YOU SOLD,META,META PLATFORMS INC,Cash,-30,491.20,0,0.03,,,14735.97,02/06/2025
02/03/2025,Z12345678,YOU BOUGHT,AMZN,AMAZON.COM INC,Cash,70,185.40,0,0.06,,,-12978.06,02/05/2025
02/10/2025,Z12345678,YOU SOLD,AMZN,AMAZON.COM INC,Cash,-70,178.20,0,0.06,,,-12474.06,02/12/2025
02/07/2025,Z12345678,YOU BOUGHT,GOOGL,ALPHABET INC,Cash,90,145.60,0,0.07,,,-13104.07,02/11/2025
02/18/2025,Z12345678,YOU SOLD,GOOGL,ALPHABET INC,Cash,-90,156.30,0,0.07,,,14066.93,02/20/2025
02/12/2025,Z12345678,YOU BOUGHT,AMD,ADVANCED MICRO DEVICES,Cash,120,158.40,0,0.09,,,-19008.09,02/14/2025
02/20/2025,Z12345678,YOU SOLD,AMD,ADVANCED MICRO DEVICES,Cash,-120,149.80,0,0.09,,,-17976.09,02/24/2025
02/18/2025,Z12345678,YOU BOUGHT,JPM,JPMORGAN CHASE,Cash,40,201.30,0,0.03,,,-8052.03,02/20/2025
02/26/2025,Z12345678,YOU SOLD,JPM,JPMORGAN CHASE,Cash,-40,212.50,0,0.03,,,8499.97,02/28/2025
02/24/2025,Z12345678,YOU BOUGHT,V,VISA INC,Cash,25,282.40,0,0.02,,,-7060.02,02/26/2025
03/04/2025,Z12345678,YOU SOLD,V,VISA INC,Cash,-25,290.10,0,0.02,,,7252.48,03/06/2025
03/03/2025,Z12345678,YOU BOUGHT,NFLX,NETFLIX INC,Cash,15,905.20,0,0.07,,,-13578.07,03/05/2025
03/11/2025,Z12345678,YOU SOLD,NFLX,NETFLIX INC,Cash,-15,882.60,0,0.07,,,-13239.07,03/13/2025
03/06/2025,Z12345678,YOU BOUGHT,SPY,SPDR S&P 500 ETF,Cash,100,515.80,0,0.08,,,-51580.08,03/10/2025
03/14/2025,Z12345678,YOU SOLD,SPY,SPDR S&P 500 ETF,Cash,-100,524.30,0,0.08,,,52429.92,03/18/2025
03/10/2025,Z12345678,YOU BOUGHT,QQQ,INVESCO QQQ TRUST,Cash,60,442.10,0,0.05,,,-26526.05,03/12/2025
03/18/2025,Z12345678,YOU SOLD,QQQ,INVESCO QQQ TRUST,Cash,-60,451.90,0,0.05,,,27113.95,03/20/2025
03/14/2025,Z12345678,YOU BOUGHT,DIS,WALT DISNEY CO,Cash,80,112.30,0,0.06,,,-8984.06,03/18/2025
03/24/2025,Z12345678,YOU SOLD,DIS,WALT DISNEY CO,Cash,-80,108.70,0,0.06,,,-8696.06,03/26/2025
03/20/2025,Z12345678,YOU BOUGHT,BA,BOEING CO,Cash,35,188.50,0,0.03,,,-6597.53,03/24/2025
03/28/2025,Z12345678,YOU SOLD,BA,BOEING CO,Cash,-35,201.20,0,0.03,,,7041.97,04/01/2025
03/26/2025,Z12345678,YOU BOUGHT,COST,COSTCO WHOLESALE CORP,Cash,12,920.40,0,0.08,,,-11044.88,03/28/2025
04/03/2025,Z12345678,YOU SOLD,COST,COSTCO WHOLESALE CORP,Cash,-12,935.80,0,0.08,,,11229.52,04/07/2025
04/01/2025,Z12345678,YOU BOUGHT,CRM,SALESFORCE INC,Cash,45,310.20,0,0.04,,,-13959.04,04/03/2025
04/09/2025,Z12345678,YOU SOLD,CRM,SALESFORCE INC,Cash,-45,298.40,0,0.04,,,-13428.04,04/11/2025
04/07/2025,Z12345678,YOU BOUGHT,INTC,INTEL CORP,Cash,200,22.80,0,0.10,,,-4560.10,04/09/2025
04/15/2025,Z12345678,YOU SOLD,INTC,INTEL CORP,Cash,-200,24.60,0,0.10,,,4919.90,04/17/2025
04/10/2025,Z12345678,YOU BOUGHT,SOFI,SOFI TECHNOLOGIES,Cash,300,10.20,0,0.12,,,-3060.12,04/14/2025
04/18/2025,Z12345678,YOU SOLD,SOFI,SOFI TECHNOLOGIES,Cash,-300,11.80,0,0.12,,,3539.88,04/22/2025`;

function parseSchwabCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("date") && l.includes("action") && l.includes("symbol") && l.includes("quantity") && l.includes("price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("Transactions Total")) continue;
    const vals = line.split(",");
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
    const action = (row["action"] || "").toUpperCase();
    if (!action.includes("BUY") && !action.includes("SELL")) continue;
    trades.push({
      date: row["date"] || "", symbol: (row["symbol"] || "").replace(/\s+/g, ""),
      description: row["description"] || "", action: action.includes("BUY") ? "BUY" : "SELL",
      quantity: Math.abs(parseFloat((row["quantity"] || "").replace(/[,$]/g, "")) || 0),
      price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: parseFloat((row["commission"] || row["commissions & fees"] || "").replace(/[,$]/g, "")) || 0,
      fees: parseFloat((row["fees"] || "").replace(/[,$]/g, "")) || 0,
      amount: parseFloat((row["amount"] || "").replace(/[,$]/g, "")) || 0,
    });
  }
  return trades;
}

function parseIBKRCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if ((l.includes("trades") && l.includes("header")) || (l.includes("date/time") && l.includes("symbol") && l.includes("t. price"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const rawHeaders = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.toLowerCase().includes("trades,total") || line.toLowerCase().includes("\"trades\",\"total\"")) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    rawHeaders.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const symbol = row["symbol"] || "";
    if (!symbol) continue;
    const qty = parseFloat(row["quantity"] || "0") || 0;
    if (qty === 0) continue;
    const dateStr = row["date/time"] || row["datetime"] || "";
    const price = parseFloat(row["t. price"] || row["tradeprice"] || row["price"] || "0") || 0;
    const comm = Math.abs(parseFloat(row["comm/fee"] || row["ibcommission"] || row["commission"] || "0") || 0);
    trades.push({
      date: dateStr.split(",")[0] || dateStr.split(" ")[0] || dateStr,
      symbol: symbol.split(" ")[0], description: "", action: qty > 0 ? "BUY" : "SELL",
      quantity: Math.abs(qty), price, commission: comm, fees: 0, amount: Math.abs(qty) * price,
    });
  }
  return trades;
}

function parseWebullCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("symbol") && (l.includes("side") || l.includes("action")) && (l.includes("qty") || l.includes("quantity")) && l.includes("price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const side = (row["side"] || row["action"] || "").toUpperCase();
    if (!side.includes("BUY") && !side.includes("SELL")) continue;
    const filledTime = row["filled time"] || row["time"] || row["date"] || row["filled"] || "";
    trades.push({
      date: filledTime.split(" ")[0] || filledTime,
      symbol: (row["symbol"] || "").replace(/\s+/g, ""), description: row["name"] || "",
      action: side.includes("BUY") ? "BUY" : "SELL",
      quantity: Math.abs(parseFloat((row["qty"] || row["quantity"] || row["filled qty"] || "").replace(/[,$]/g, "")) || 0),
      price: parseFloat((row["avg price"] || row["price"] || row["filled price"] || "").replace(/[,$]/g, "")) || 0,
      commission: 0, fees: 0, amount: 0,
    });
  }
  return trades;
}

function parseTradovateCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("b/s") && (l.includes("contract") || l.includes("product")) && (l.includes("qty") || l.includes("filled qty") || l.includes("filledqty"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const bs = (row["b/s"] || "").toUpperCase();
    if (!bs.includes("BUY") && !bs.includes("SELL") && bs !== "B" && bs !== "S") continue;
    const contract = row["contract"] || row["symbol"] || "";
    const product = row["product"] || "";
    // Extract base symbol from futures contract (e.g., ESZ4 -> ES, MESZ4 -> MES)
    const symbol = product || contract.replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "") || contract;
    if (!symbol) continue;
    const qty = Math.abs(parseFloat(row["filledqty"] || row["filled qty"] || row["qty"] || row["quantity"] || "0")) || 0;
    if (qty === 0) continue;
    const price = parseFloat(row["avgprice"] || row["avg fill price"] || row["avgfillprice"] || row["price"] || "0") || 0;
    const dateStr = row["fill time"] || row["filltime"] || row["timestamp"] || row["date"] || "";
    // Handle ISO dates, strip time portion for date
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
    trades.push({
      date: datePart, symbol: symbol.toUpperCase(), description: row["product description"] || contract,
      action: (bs.includes("BUY") || bs === "B") ? "BUY" : "SELL",
      quantity: qty, price, commission: 0, fees: 0, amount: qty * price,
    });
  }
  return trades;
}

function parseAMPFuturesCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    // CQG Desktop format: Account, Status, B/S, Qty, ..., Symbol, Avg Fill P, ...
    if ((l.includes("b/s") || l.includes("buy/sell")) && (l.includes("avg fill") || l.includes("avgfillprice") || l.includes("fill p")) && (l.includes("symbol") || l.includes("contract"))) { headerIdx = i; break; }
    // Rithmic format: Account, Status, Buy/Sell, Qty To Fill, Symbol, Qty Filled, Avg Fill Price, ...
    if (l.includes("buy/sell") && l.includes("qty filled") && l.includes("avg fill price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    // Skip non-filled orders
    const status = (row["status"] || "").toLowerCase();
    if (status && !status.includes("fill") && !status.includes("complete")) continue;
    const bs = (row["b/s"] || row["buy/sell"] || "").toUpperCase();
    if (!bs.includes("BUY") && !bs.includes("SELL") && bs !== "B" && bs !== "S") continue;
    const rawSymbol = row["symbol"] || row["contract"] || "";
    if (!rawSymbol) continue;
    // CQG symbols like F.US.EPH25 or EPH25 -> strip prefix and contract month
    let symbol = rawSymbol;
    if (symbol.includes(".")) symbol = symbol.split(".").pop(); // F.US.EPH25 -> EPH25
    // Strip contract month/year suffix for grouping (e.g., EPH25 -> EP, ENQZ4 -> ENQ)
    const baseSymbol = symbol.replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "") || symbol;
    const qty = Math.abs(parseFloat(row["fld"] || row["qty filled"] || row["filledqty"] || row["qty"] || row["quantity"] || "0")) || 0;
    if (qty === 0) continue;
    const price = parseFloat(row["avg fill p"] || row["avg fill price"] || row["avgfillprice"] || row["price"] || "0") || 0;
    const fee = Math.abs(parseFloat(row["fee"] || row["commission"] || "0")) || 0;
    const dateStr = row["fill t"] || row["update time"] || row["create time"] || row["place t"] || row["date"] || "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
    trades.push({
      date: datePart, symbol: baseSymbol.toUpperCase(), description: rawSymbol,
      action: (bs.includes("BUY") || bs === "B") ? "BUY" : "SELL",
      quantity: qty, price, commission: fee, fees: 0, amount: qty * price,
    });
  }
  return trades;
}

function parseTradeLockerCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    // Closed positions format: side/type + open price + close price + profit
    if (l.includes("side") && l.includes("open price") && l.includes("close price") && (l.includes("profit") || l.includes("pl") || l.includes("p&l"))) { headerIdx = i; break; }
    if (l.includes("type") && l.includes("open price") && l.includes("close price") && (l.includes("profit") || l.includes("pl"))) { headerIdx = i; break; }
    // Order history format: side + qty + avgprice / avg price
    if (l.includes("side") && (l.includes("qty") || l.includes("volume") || l.includes("lots")) && l.includes("symbol") && (l.includes("avgprice") || l.includes("avg price") || l.includes("price"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const hasClosePrice = headers.some(h => h.includes("close price") || h === "closeprice");
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const side = (row["side"] || row["type"] || row["direction"] || "").toUpperCase();
    if (!side.includes("BUY") && !side.includes("SELL") && !side.includes("LONG") && !side.includes("SHORT")) continue;
    const symbol = (row["symbol"] || row["instrument"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const isBuy = side.includes("BUY") || side.includes("LONG");
    const qty = Math.abs(parseFloat(row["volume"] || row["lots"] || row["qty"] || row["quantity"] || "0")) || 0;
    if (qty === 0) continue;
    const commission = Math.abs(parseFloat(row["commission"] || "0")) || 0;
    const swap = Math.abs(parseFloat(row["swap"] || "0")) || 0;
    if (hasClosePrice) {
      // Completed position: split into a buy + sell pair for matchTrades
      const openPrice = parseFloat(row["open price"] || row["openprice"] || "0") || 0;
      const closePrice = parseFloat(row["close price"] || row["closeprice"] || "0") || 0;
      let openDate = row["open time"] || row["opentime"] || row["open date"] || row["opendate"] || "";
      let closeDate = row["close time"] || row["closetime"] || row["close date"] || row["closedate"] || "";
      // Handle epoch ms timestamps
      if (/^\d{10,13}$/.test(openDate)) openDate = new Date(Number(openDate.length > 10 ? openDate : openDate + "000")).toISOString().split("T")[0];
      else openDate = openDate.includes("T") ? openDate.split("T")[0] : openDate.split(" ")[0] || openDate;
      if (/^\d{10,13}$/.test(closeDate)) closeDate = new Date(Number(closeDate.length > 10 ? closeDate : closeDate + "000")).toISOString().split("T")[0];
      else closeDate = closeDate.includes("T") ? closeDate.split("T")[0] : closeDate.split(" ")[0] || closeDate;
      // For a long position: buy at open, sell at close
      // For a short position: sell at open, buy at close
      trades.push({
        date: openDate, symbol, description: "",
        action: isBuy ? "BUY" : "SELL",
        quantity: qty, price: openPrice, commission: commission / 2, fees: swap / 2, amount: qty * openPrice,
      });
      trades.push({
        date: closeDate, symbol, description: "",
        action: isBuy ? "SELL" : "BUY",
        quantity: qty, price: closePrice, commission: commission / 2, fees: swap / 2, amount: qty * closePrice,
      });
    } else {
      // Individual fills format
      const price = parseFloat(row["avgprice"] || row["avg price"] || row["price"] || "0") || 0;
      let dateStr = row["createddate"] || row["created date"] || row["date"] || row["time"] || "";
      if (/^\d{10,13}$/.test(dateStr)) dateStr = new Date(Number(dateStr.length > 10 ? dateStr : dateStr + "000")).toISOString().split("T")[0];
      else dateStr = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
      trades.push({
        date: dateStr, symbol, description: "",
        action: isBuy ? "BUY" : "SELL",
        quantity: qty, price, commission, fees: swap, amount: qty * price,
      });
    }
  }
  return trades;
}

function parseETradeCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("symbol") && (l.includes("est. comm") || l.includes("est. fee") || l.includes("execution time"))) { headerIdx = i; break; }
    if (l.includes("symbol") && l.includes("type") && (l.includes("qty") || l.includes("quantity")) && l.includes("price") && l.includes("amount")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const type = (row["type"] || row["action"] || row["transaction type"] || "").toUpperCase();
    if (!type.includes("BUY") && !type.includes("SELL") && !type.includes("BOUGHT") && !type.includes("SOLD")) continue;
    const symbol = (row["symbol"] || row["u/l"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["qty"] || row["quantity"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    const price = parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0;
    const comm = Math.abs(parseFloat((row["est. comm"] || row["commission"] || "").replace(/[,$]/g, "")) || 0);
    const fees = Math.abs(parseFloat((row["est. fee"] || row["fee"] || row["fees"] || "").replace(/[,$]/g, "")) || 0);
    const amount = parseFloat((row["est. amount"] || row["amount"] || "").replace(/[,$]/g, "")) || qty * price;
    const dateStr = row["date"] || row["execution time"] || "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
    trades.push({
      date: datePart, symbol, description: row["description"] || "",
      action: (type.includes("BUY") || type.includes("BOUGHT")) ? "BUY" : "SELL",
      quantity: qty, price, commission: comm, fees, amount: Math.abs(amount),
    });
  }
  return trades;
}

function parseRobinhoodCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("activity date") && l.includes("trans code") && l.includes("instrument")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const code = (row["trans code"] || "").toUpperCase();
    if (!code.includes("BUY") && !code.includes("SELL") && code !== "STO" && code !== "BTO" && code !== "STC" && code !== "BTC") continue;
    const instrument = (row["instrument"] || row["symbol"] || "").replace(/\s+/g, "");
    if (!instrument) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    const isBuy = code.includes("BUY") || code === "BTO" || code === "BTC";
    trades.push({
      date: row["activity date"] || "", symbol: instrument, description: row["description"] || "",
      action: isBuy ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: 0, fees: 0, amount: Math.abs(parseFloat((row["amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseQuestradeCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("transaction date") && l.includes("action") && l.includes("symbol") && (l.includes("gross amount") || l.includes("net amount"))) { headerIdx = i; break; }
    if (l.includes("settlement date") && l.includes("action") && l.includes("symbol") && l.includes("quantity")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const action = (row["action"] || "").toUpperCase();
    if (!action.includes("BUY") && !action.includes("SELL")) continue;
    const symbol = (row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    const dateStr = row["transaction date"] || row["settlement date"] || "";
    // Handle D/M/Y format common in Questrade
    let datePart = dateStr;
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3 && parts[0].length <= 2) datePart = `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    trades.push({
      date: datePart.split(" ")[0] || datePart, symbol, description: row["description"] || "",
      action: action.includes("BUY") ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: Math.abs(parseFloat((row["commission"] || "").replace(/[,$]/g, "")) || 0),
      fees: 0, amount: Math.abs(parseFloat((row["gross amount"] || row["net amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseAlpacaCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("symbol") && l.includes("side") && (l.includes("filled_avg_price") || l.includes("filled avg price") || l.includes("filled_qty"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const side = (row["side"] || "").toUpperCase();
    if (side !== "BUY" && side !== "SELL") continue;
    const status = (row["status"] || "").toLowerCase();
    if (status && status !== "filled" && status !== "partially_filled") continue;
    const symbol = (row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat(row["filled_qty"] || row["qty"] || "0") || 0);
    if (qty === 0) continue;
    const price = parseFloat(row["filled_avg_price"] || row["price"] || "0") || 0;
    const dateStr = row["filled_at"] || row["created_at"] || row["submitted_at"] || "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
    trades.push({
      date: datePart, symbol, description: "",
      action: side, quantity: qty, price,
      commission: 0, fees: 0, amount: qty * price,
    });
  }
  return trades;
}

function parseWealthSimpleCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("date") && (l.includes("transaction") || l.includes("type")) && l.includes("symbol") && l.includes("quantity") && l.includes("price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const type = (row["transaction"] || row["type"] || row["action"] || "").toUpperCase();
    if (!type.includes("BUY") && !type.includes("SELL")) continue;
    const symbol = (row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || row["shares"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    trades.push({
      date: (row["date"] || "").split(" ")[0], symbol, description: row["description"] || "",
      action: type.includes("BUY") ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: 0, fees: 0,
      amount: Math.abs(parseFloat((row["amount"] || row["market value"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseTrading212CSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("action") && l.includes("ticker") && (l.includes("no. of shares") || l.includes("no of shares")) && (l.includes("price / share") || l.includes("price/share"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const action = (row["action"] || "").toUpperCase();
    if (!action.includes("BUY") && !action.includes("SELL") && action !== "MARKET BUY" && action !== "MARKET SELL" && action !== "LIMIT BUY" && action !== "LIMIT SELL") continue;
    const ticker = (row["ticker"] || row["symbol"] || "").replace(/\s+/g, "");
    if (!ticker) continue;
    const qty = Math.abs(parseFloat(row["no. of shares"] || row["no of shares"] || row["quantity"] || "0") || 0);
    if (qty === 0) continue;
    const price = parseFloat((row["price / share"] || row["price/share"] || row["price"] || "0").replace(/[,$]/g, "")) || 0;
    const total = Math.abs(parseFloat((row["total"] || "0").replace(/[,$]/g, "")) || 0);
    const dateStr = row["time"] || row["date"] || "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0] || dateStr;
    const isBuy = action.includes("BUY");
    const charge = Math.abs(parseFloat((row["charge amount"] || row["charges"] || "0").replace(/[,$]/g, "")) || 0);
    trades.push({
      date: datePart, symbol: ticker, description: row["name"] || "",
      action: isBuy ? "BUY" : "SELL",
      quantity: qty, price, commission: charge, fees: 0, amount: total || qty * price,
    });
  }
  return trades;
}

function parseDEGIROCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("product") && l.includes("isin") && (l.includes("number") || l.includes("quantity")) && (l.includes("local value") || l.includes("transaction"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const qty = parseFloat(row["number"] || row["quantity"] || "0") || 0;
    if (qty === 0) continue;
    const product = row["product"] || "";
    if (!product) continue;
    const price = Math.abs(parseFloat((row["price"] || "0").replace(/[,$]/g, "")) || 0);
    const txCosts = Math.abs(parseFloat((row["transaction costs"] || row["transaction and/or third"] || "0").replace(/[,$]/g, "")) || 0);
    const dateStr = row["date"] || "";
    // DEGIRO: positive qty = buy, negative qty = sell
    trades.push({
      date: dateStr.split(" ")[0] || dateStr,
      symbol: (row["isin"] || product.split(" ")[0] || "").replace(/\s+/g, ""),
      description: product, action: qty > 0 ? "BUY" : "SELL",
      quantity: Math.abs(qty), price, commission: txCosts, fees: 0,
      amount: Math.abs(parseFloat((row["total"] || row["value"] || row["local value"] || "0").replace(/[,$]/g, "")) || qty * price),
    });
  }
  return trades;
}

function parseZerodhaCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("tradingsymbol") && l.includes("trade_type") && l.includes("quantity") && l.includes("price")) { headerIdx = i; break; }
    if (l.includes("trading symbol") && l.includes("trade type") && l.includes("quantity") && l.includes("price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const tradeType = (row["trade_type"] || row["trade type"] || "").toUpperCase();
    if (!tradeType.includes("BUY") && !tradeType.includes("SELL")) continue;
    const symbol = (row["tradingsymbol"] || row["trading symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat(row["quantity"] || "0") || 0);
    if (qty === 0) continue;
    const dateStr = row["trade_date"] || row["trade date"] || "";
    trades.push({
      date: dateStr.split(" ")[0] || dateStr, symbol, description: row["exchange"] || "",
      action: tradeType.includes("BUY") ? "BUY" : "SELL",
      quantity: qty, price: parseFloat(row["price"] || "0") || 0,
      commission: 0, fees: 0, amount: qty * (parseFloat(row["price"] || "0") || 0),
    });
  }
  return trades;
}

function parseChaseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("trade date") && l.includes("symbol") && (l.includes("trans type") || l.includes("type")) && (l.includes("quantity") || l.includes("qty"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const type = (row["trans type"] || row["type"] || row["action"] || "").toUpperCase();
    if (!type.includes("BUY") && !type.includes("SELL") && !type.includes("BOUGHT") && !type.includes("SOLD")) continue;
    const symbol = (row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || row["qty"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    trades.push({
      date: (row["trade date"] || "").split(" ")[0], symbol, description: row["description"] || "",
      action: (type.includes("BUY") || type.includes("BOUGHT")) ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: Math.abs(parseFloat((row["commission"] || "").replace(/[,$]/g, "")) || 0),
      fees: Math.abs(parseFloat((row["fees"] || "").replace(/[,$]/g, "")) || 0),
      amount: Math.abs(parseFloat((row["amount"] || row["net amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseVanguardCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("trade date") && l.includes("transaction type") && (l.includes("share price") || l.includes("shares")) && l.includes("symbol")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 5) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const type = (row["transaction type"] || "").toUpperCase();
    if (!type.includes("BUY") && !type.includes("SELL")) continue;
    const symbol = (row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["shares"] || row["quantity"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    trades.push({
      date: (row["trade date"] || "").split(" ")[0], symbol,
      description: row["investment name"] || row["name"] || "",
      action: type.includes("BUY") ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["share price"] || row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: Math.abs(parseFloat((row["commission"] || "").replace(/[,$]/g, "")) || 0),
      fees: 0, amount: Math.abs(parseFloat((row["principal amount"] || row["net amount"] || row["amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parsePublicCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("side") && l.includes("symbol") && (l.includes("quantity") || l.includes("qty")) && l.includes("price") && !l.includes("filled qty") && !l.includes("avg price")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const side = (row["side"] || "").toUpperCase();
    if (!side.includes("BUY") && !side.includes("SELL")) continue;
    const symbol = (row["symbol"] || row["ticker"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || row["qty"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    const dateStr = row["date"] || row["time"] || "";
    trades.push({
      date: dateStr.split(" ")[0] || dateStr, symbol, description: row["name"] || row["description"] || "",
      action: side.includes("BUY") ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || "").replace(/[,$]/g, "")) || 0,
      commission: 0, fees: 0,
      amount: Math.abs(parseFloat((row["total"] || row["amount"] || row["value"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseCommSecCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if ((l.includes("security code") || l.includes("code")) && l.includes("brokerage") && (l.includes("quantity") || l.includes("units"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const type = (row["type"] || row["action"] || row["transaction type"] || row["details"] || "").toUpperCase();
    if (!type.includes("BUY") && !type.includes("SELL") && !type.includes("B") && !type.includes("S")) continue;
    const isBuy = type.includes("BUY") || (type === "B");
    const symbol = (row["security code"] || row["code"] || row["symbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || row["units"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    trades.push({
      date: (row["date"] || row["trade date"] || "").split(" ")[0], symbol,
      description: row["security name"] || row["name"] || "",
      action: isBuy ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || row["unit price"] || "").replace(/[,$]/g, "")) || 0,
      commission: Math.abs(parseFloat((row["brokerage"] || row["commission"] || "").replace(/[,$]/g, "")) || 0),
      fees: Math.abs(parseFloat((row["gst"] || row["fees"] || "").replace(/[,$]/g, "")) || 0),
      amount: Math.abs(parseFloat((row["net proceeds"] || row["consideration"] || row["amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

function parseGenericBrokerCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if ((l.includes("date") || l.includes("time")) && (l.includes("symbol") || l.includes("ticker") || l.includes("instrument") || l.includes("stock") || l.includes("code")) && (l.includes("quantity") || l.includes("qty") || l.includes("shares") || l.includes("units")) && (l.includes("price") || l.includes("amount"))) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$"]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    if (vals.length < 4) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
    const action = (row["action"] || row["type"] || row["transaction type"] || row["trans type"] || row["side"] || row["transaction"] || row["trade type"] || row["trade_type"] || "").toUpperCase();
    if (!action.includes("BUY") && !action.includes("SELL") && !action.includes("BOUGHT") && !action.includes("SOLD") && !action.includes("LONG") && !action.includes("SHORT")) continue;
    const isBuy = action.includes("BUY") || action.includes("BOUGHT") || action.includes("LONG");
    const symbol = (row["symbol"] || row["ticker"] || row["instrument"] || row["stock"] || row["code"] || row["security code"] || row["tradingsymbol"] || "").replace(/\s+/g, "");
    if (!symbol) continue;
    const qty = Math.abs(parseFloat((row["quantity"] || row["qty"] || row["shares"] || row["units"] || row["no. of shares"] || row["number"] || row["filled_qty"] || "").replace(/[,$]/g, "")) || 0);
    if (qty === 0) continue;
    const dateStr = row["date"] || row["trade date"] || row["trade_date"] || row["transaction date"] || row["activity date"] || row["time"] || "";
    trades.push({
      date: (dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.split(" ")[0]) || dateStr, symbol,
      description: row["description"] || row["name"] || row["product"] || "",
      action: isBuy ? "BUY" : "SELL",
      quantity: qty, price: parseFloat((row["price"] || row["share price"] || row["price / share"] || row["filled_avg_price"] || row["avg price"] || "").replace(/[,$]/g, "")) || 0,
      commission: Math.abs(parseFloat((row["commission"] || row["comm"] || row["brokerage"] || row["est. comm"] || "").replace(/[,$]/g, "")) || 0),
      fees: Math.abs(parseFloat((row["fees"] || row["fee"] || row["charges"] || row["est. fee"] || row["transaction costs"] || "").replace(/[,$]/g, "")) || 0),
      amount: Math.abs(parseFloat((row["amount"] || row["total"] || row["net amount"] || row["value"] || row["principal amount"] || "").replace(/[,$]/g, "")) || 0),
    });
  }
  return trades;
}

// ── Cash event parsers: extract dividends, deposits, withdrawals, interest from broker CSVs ──

function parseFidelityCashEvents(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("run date") && l.includes("action")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$]/g, ""));
  const events = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",");
    if (vals.length < 6) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
    const action = (row["action"] || "").toUpperCase();
    const amount = parseFloat((row["amount"] || row["amount "] || "0").replace(/[,$]/g, "")) || 0;
    if (amount === 0) continue;
    // Skip buy/sell — those are already handled as trades
    if (action.includes("BOUGHT") || action.includes("SOLD")) continue;
    let type = null;
    if (action.includes("DIVIDEND") || action.includes("REINVESTMENT")) type = "DIVIDEND";
    else if (action.includes("INTEREST")) type = "INTEREST";
    else if (action.includes("DIRECT DEPOSIT") || action.includes("TRANSFERRED FROM") || action.includes("ELECTRONIC FUNDS TRANSFER RECEIVED")) type = "DEPOSIT";
    else if (action.includes("TRANSFERRED TO") || action.includes("DISTRIBUTION")) type = "WITHDRAWAL";
    if (!type) continue;
    events.push({
      date: row["run date"] || row["date"] || "",
      type,
      amount,
      symbol: row["symbol"] || null,
      description: row["security description"] || row["action"] || "",
    });
  }
  return events;
}

function parseSchwabCashEvents(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("date") && l.includes("action") && l.includes("amount")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$]/g, ""));
  const events = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("Transactions Total")) continue;
    const vals = line.split(",");
    if (vals.length < 3) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
    const action = (row["action"] || "").toUpperCase();
    const amount = parseFloat((row["amount"] || "0").replace(/[,$]/g, "")) || 0;
    if (amount === 0) continue;
    // Skip buy/sell
    if (action.includes("BUY") || action.includes("SELL")) continue;
    let type = null;
    if (action.includes("DIVIDEND") || action.includes("REINVEST")) type = "DIVIDEND";
    else if (action.includes("INTEREST")) type = "INTEREST";
    else if (action.includes("WIRE FUNDS REC") || action.includes("MONEYLINK TRANSFER") || action.includes("FUNDS RECEIVED") || action.includes("CASH IN LIEU")) type = "DEPOSIT";
    else if (action.includes("WIRE FUNDS") || action.includes("FUNDS DISBURSED")) type = "WITHDRAWAL";
    else if (action.includes("JOURNAL")) type = "TRANSFER";
    if (!type) continue;
    events.push({
      date: row["date"] || "",
      type,
      amount,
      symbol: (row["symbol"] || "").replace(/\s+/g, "") || null,
      description: row["description"] || row["action"] || "",
    });
  }
  return events;
}

// Map of broker names to their cash event parser (only brokers with dedicated cash parsers)
const CASH_EVENT_PARSERS = {
  "Fidelity": parseFidelityCashEvents,
  "Schwab": parseSchwabCashEvents,
};

function parseCSVAuto(csvText) {
  const lower = csvText.toLowerCase();
  let result = null;

  // Fidelity: "Run Date" + "YOU BOUGHT"
  if (lower.includes("run date") && (lower.includes("you bought") || lower.includes("you sold"))) {
    result = { trades: parseFidelityCSV(csvText), broker: "Fidelity" };
  }
  // IBKR: "Trades" + "Header" or "Date/Time" + "T. Price"
  else if ((lower.includes("trades") && lower.includes("header")) || (lower.includes("date/time") && lower.includes("t. price"))) {
    result = { trades: parseIBKRCSV(csvText), broker: "Interactive Brokers" };
  }
  // Tradovate: "B/S" + "Contract" + "Product" (futures-specific columns)
  else if (lower.includes("b/s") && lower.includes("contract") && lower.includes("product")) {
    const tv = parseTradovateCSV(csvText);
    if (tv.length) result = { trades: tv, broker: "Tradovate" };
  }
  // AMP/CQG: "B/S" + "Avg Fill P" (CQG Desktop format)
  if (!result && lower.includes("b/s") && lower.includes("avg fill p")) {
    const amp = parseAMPFuturesCSV(csvText);
    if (amp.length) result = { trades: amp, broker: "AMP Futures" };
  }
  // AMP/Rithmic: "Buy/Sell" + "Qty Filled" + "Avg Fill Price"
  if (!result && lower.includes("buy/sell") && lower.includes("qty filled") && lower.includes("avg fill price")) {
    const amp = parseAMPFuturesCSV(csvText);
    if (amp.length) result = { trades: amp, broker: "AMP Futures" };
  }
  // TradeLocker: "side" + "open price" + "close price" (closed positions)
  if (!result && lower.includes("side") && lower.includes("open price") && lower.includes("close price")) {
    const tl = parseTradeLockerCSV(csvText);
    if (tl.length) result = { trades: tl, broker: "TradeLocker" };
  }
  // TradeLocker: individual fills with "side" + "symbol" + ("volume" or "lots")
  if (!result && lower.includes("side") && lower.includes("symbol") && (lower.includes("volume") || lower.includes("lots")) && !lower.includes("filled qty")) {
    const tl = parseTradeLockerCSV(csvText);
    if (tl.length) result = { trades: tl, broker: "TradeLocker" };
  }
  // Webull: "side" + "avg price" or "filled qty"
  if (!result && ((lower.includes("side") && lower.includes("avg price")) || (lower.includes("filled qty")))) {
    result = { trades: parseWebullCSV(csvText), broker: "Webull" };
  }
  // Schwab: "action" + "symbol" + "quantity" (no "Run Date")
  if (!result && lower.includes("action") && lower.includes("symbol") && lower.includes("quantity") && !lower.includes("run date") && !lower.includes("ticker") && !lower.includes("isin")) {
    const schwab = parseSchwabCSV(csvText);
    if (schwab.length) result = { trades: schwab, broker: "Schwab" };
  }
  // E*TRADE: "execution time" or "est. comm" or "est. fee"
  if (!result && lower.includes("symbol") && (lower.includes("est. comm") || lower.includes("est. fee") || lower.includes("execution time"))) {
    const et = parseETradeCSV(csvText);
    if (et.length) result = { trades: et, broker: "E*TRADE" };
  }
  // Robinhood: "activity date" + "trans code" + "instrument"
  if (!result && lower.includes("activity date") && lower.includes("trans code") && lower.includes("instrument")) {
    const rh = parseRobinhoodCSV(csvText);
    if (rh.length) result = { trades: rh, broker: "Robinhood" };
  }
  // Questrade: "transaction date" + ("gross amount" or "net amount") + "action"
  if (!result && lower.includes("transaction date") && lower.includes("action") && (lower.includes("gross amount") || lower.includes("net amount"))) {
    const qt = parseQuestradeCSV(csvText);
    if (qt.length) result = { trades: qt, broker: "Questrade" };
  }
  // Alpaca: "side" + "filled_avg_price" or "filled_qty"
  if (!result && lower.includes("side") && (lower.includes("filled_avg_price") || lower.includes("filled avg price")) && lower.includes("symbol")) {
    const al = parseAlpacaCSV(csvText);
    if (al.length) result = { trades: al, broker: "Alpaca" };
  }
  // Trading212: "ticker" + ("no. of shares" or "no of shares") + "price / share"
  if (!result && lower.includes("ticker") && (lower.includes("no. of shares") || lower.includes("no of shares")) && (lower.includes("price / share") || lower.includes("price/share"))) {
    const t212 = parseTrading212CSV(csvText);
    if (t212.length) result = { trades: t212, broker: "Trading212" };
  }
  // DEGIRO: "product" + "isin" + ("local value" or "transaction costs")
  if (!result && lower.includes("product") && lower.includes("isin") && (lower.includes("local value") || lower.includes("transaction costs") || lower.includes("transaction and/or"))) {
    const dg = parseDEGIROCSV(csvText);
    if (dg.length) result = { trades: dg, broker: "DEGIRO" };
  }
  // Zerodha / Upstox: "tradingsymbol" + "trade_type"
  if (!result && ((lower.includes("tradingsymbol") || lower.includes("trading symbol")) && (lower.includes("trade_type") || lower.includes("trade type")))) {
    const zd = parseZerodhaCSV(csvText);
    if (zd.length) result = { trades: zd, broker: "Zerodha" };
  }
  // Vanguard: "trade date" + "transaction type" + ("share price" or "shares")
  if (!result && lower.includes("trade date") && lower.includes("transaction type") && (lower.includes("share price") || lower.includes("principal amount"))) {
    const vg = parseVanguardCSV(csvText);
    if (vg.length) result = { trades: vg, broker: "Vanguard" };
  }
  // Chase / JP Morgan: "trade date" + "trans type" + "symbol"
  if (!result && lower.includes("trade date") && lower.includes("trans type") && lower.includes("symbol")) {
    const ch = parseChaseCSV(csvText);
    if (ch.length) result = { trades: ch, broker: "Chase" };
  }
  // WealthSimple: "date" + "transaction" + "symbol" + "quantity"
  if (!result && lower.includes("transaction") && lower.includes("symbol") && lower.includes("quantity") && !lower.includes("transaction date") && !lower.includes("trans code")) {
    const ws = parseWealthSimpleCSV(csvText);
    if (ws.length) result = { trades: ws, broker: "Wealthsimple" };
  }
  // CommSec: "security code" + "brokerage"
  if (!result && lower.includes("security code") && lower.includes("brokerage")) {
    const cs = parseCommSecCSV(csvText);
    if (cs.length) result = { trades: cs, broker: "CommSec" };
  }
  // Public.com: "side" + "symbol" + "quantity" (no webull-specific cols)
  if (!result && lower.includes("side") && lower.includes("symbol") && (lower.includes("quantity") || lower.includes("qty")) && !lower.includes("avg price") && !lower.includes("filled qty") && !lower.includes("volume") && !lower.includes("lots") && !lower.includes("filled_avg_price")) {
    const pub = parsePublicCSV(csvText);
    if (pub.length) result = { trades: pub, broker: "Public" };
  }

  // Fallback: try all parsers
  if (!result) {
    const fidelity = parseFidelityCSV(csvText);
    if (fidelity.length) { result = { trades: fidelity, broker: "Fidelity" }; }
    else {
      for (const [fn, name] of [
        [parseSchwabCSV, "Schwab"], [parseIBKRCSV, "IBKR"], [parseWebullCSV, "Webull"],
        [parseTradovateCSV, "Tradovate"], [parseAMPFuturesCSV, "AMP Futures"], [parseTradeLockerCSV, "TradeLocker"],
        [parseETradeCSV, "E*TRADE"], [parseRobinhoodCSV, "Robinhood"], [parseQuestradeCSV, "Questrade"],
        [parseAlpacaCSV, "Alpaca"], [parseWealthSimpleCSV, "Wealthsimple"], [parseTrading212CSV, "Trading212"],
        [parseDEGIROCSV, "DEGIRO"], [parseZerodhaCSV, "Zerodha"], [parseVanguardCSV, "Vanguard"],
        [parseChaseCSV, "Chase"], [parsePublicCSV, "Public"], [parseCommSecCSV, "CommSec"],
        [parseGenericBrokerCSV, "Broker"],
      ]) {
        const r = fn(csvText);
        if (r.length) { result = { trades: r, broker: name }; break; }
      }
    }
  }

  if (!result) return { trades: [], cashEvents: [], broker: "Unknown" };

  // Parse cash events if we have a dedicated parser for this broker
  const cashParser = CASH_EVENT_PARSERS[result.broker];
  result.cashEvents = cashParser ? cashParser(csvText) : [];
  return result;
}

function parseFidelityCSV(csvText) {
  const lines = csvText.trim().split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("run date") && l.includes("symbol") && l.includes("action")) { headerIdx = i; break; }
  }
  if (headerIdx === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].split(",").length >= 8) { headerIdx = i; break; }
    }
  }
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split(",").map(h => h.trim().toLowerCase().replace(/[()$]/g, ""));
  const trades = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = line.split(",");
    if (vals.length < 6) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || "").trim(); });
    const action = (row["action"] || "").toUpperCase();
    if (!action.includes("BOUGHT") && !action.includes("SOLD")) continue;
    trades.push({
      date: row["run date"] || row["date"] || "",
      symbol: row["symbol"] || "",
      description: row["security description"] || "",
      action: action.includes("BOUGHT") ? "BUY" : "SELL",
      quantity: Math.abs(parseFloat(row["quantity"]) || 0),
      price: parseFloat(row["price"] || row["price "] || "0") || 0,
      commission: parseFloat(row["commission"] || row["commission "] || "0") || 0,
      fees: parseFloat(row["fees"] || row["fees "] || "0") || 0,
      amount: parseFloat(row["amount"] || row["amount "] || "0") || 0,
    });
  }
  return trades;
}

// Money market / cash sweep symbols to exclude from trade analysis
const MONEY_MARKET_SYMBOLS = new Set([
  'SPAXX', 'FDRXX', 'SPRXX', 'FZFXX', 'FCASH', 'FMPXX',  // Fidelity
  'SWVXX', 'SNVXX', 'SNAXX',                                // Schwab
  'VMFXX', 'VMMXX',                                          // Vanguard
  'ICASH',                                                    // IBKR
  'WFCXX',                                                    // Wells Fargo
  'CSHXX',                                                    // Generic cash sweep
]);

function matchTrades(rawTrades) {
  const buys = {};
  const matched = [];
  const sorted = [...rawTrades]
    .filter(t => !MONEY_MARKET_SYMBOLS.has(t.symbol?.toUpperCase()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  for (const trade of sorted) {
    if (trade.action === "BUY") {
      if (!buys[trade.symbol]) buys[trade.symbol] = [];
      buys[trade.symbol].push({ ...trade });
    } else if (trade.action === "SELL" && buys[trade.symbol]?.length) {
      let remaining = trade.quantity;
      while (remaining > 0 && buys[trade.symbol].length > 0) {
        const buy = buys[trade.symbol][0];
        const qty = Math.min(remaining, buy.quantity);
        const grossPnl = (trade.price - buy.price) * qty;
        const costs = (trade.fees + trade.commission + buy.fees + buy.commission) * (qty / trade.quantity);
        const pnl = grossPnl - costs;
        const holdDays = Math.max(1, Math.round((new Date(trade.date) - new Date(buy.date)) / 86400000));
        matched.push({
          symbol: trade.symbol,
          description: trade.description || buy.description,
          buyDate: buy.date,
          sellDate: trade.date,
          quantity: qty,
          buyPrice: buy.price,
          sellPrice: trade.price,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(((trade.price - buy.price) / buy.price) * 10000) / 100,
          holdDays,
          costs: Math.round(costs * 100) / 100,
          positionSize: Math.round(buy.price * qty * 100) / 100,
        });
        buy.quantity -= qty;
        remaining -= qty;
        if (buy.quantity <= 0) buys[trade.symbol].shift();
      }
    }
  }
  return matched;
}

function getSQNRating(sqn) {
  if (sqn >= 7) return { label: "Holy Grail", color: C.accent };
  if (sqn >= 5) return { label: "Superb", color: C.green };
  if (sqn >= 3) return { label: "Excellent", color: C.green };
  if (sqn >= 2) return { label: "Good", color: C.yellow };
  if (sqn >= 1.5) return { label: "Average", color: C.orange };
  return { label: "Difficult to Trade", color: C.red };
}

function getExpRatioRating(r) {
  if (r >= 0.7) return { label: "Holy Grail", color: C.accent };
  if (r >= 0.5) return { label: "Superb", color: C.green };
  if (r >= 0.3) return { label: "Excellent", color: C.green };
  if (r >= 0.25) return { label: "Good", color: C.yellow };
  if (r >= 0.2) return { label: "Average", color: C.orange };
  if (r >= 0.16) return { label: "Poor but Tradable", color: C.orange };
  return { label: "Not Tradable", color: C.red };
}

const TT = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surfaceRaised, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 10, color: C.textDim, marginBottom: 5, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.05em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color || C.text, fontWeight: 600, fontFamily: "'Inter', -apple-system, sans-serif" }}>
          {p.name}: {formatter ? formatter(p.value) : (typeof p.value === "number" ? p.value.toFixed(2) : p.value)}
        </div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, color, rating, ratingColor, small, accent }) {
  return (
    <div className="card-hover" style={{
      background: accent ? "rgba(41,151,255,0.04)" : C.surface,
      border: `0.5px solid ${accent ? "rgba(41,151,255,0.15)" : C.border}`,
      borderRadius: 20, padding: small ? "18px 20px" : "24px 26px",
      display: "flex", flexDirection: "column", gap: 8,
      minWidth: 0, animation: "slideUp 0.5s ease both",
      position: "relative", overflow: "hidden",
    }}>
      {accent && <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(41,151,255,0.04)", filter: "blur(30px)", pointerEvents: "none" }} />}
      <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span className="tabular-nums" style={{ fontSize: small ? 24 : 32, fontWeight: 700, color: color || C.text, letterSpacing: "-0.035em", animation: "countUp 0.4s ease both" }}>{value}</span>
        {rating && <span style={{ fontSize: 10, fontWeight: 600, color: ratingColor || C.accent, padding: "4px 12px", borderRadius: 980, background: `${ratingColor || C.accent}12`, letterSpacing: "0.02em" }}>{rating}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.45, fontWeight: 400 }}>{sub}</div>}
    </div>
  );
}

function ChartBox({ title, children, info }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div style={{ background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`, padding: "24px 24px 16px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</div>
        {info && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowInfo(!showInfo)} style={{ background: "rgba(255,255,255,0.04)", border: `0.5px solid ${C.border}`, borderRadius: 980, color: C.textDim, fontSize: 10, padding: "3px 10px", cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >?</button>
            {showInfo && (
              <div style={{ position: "absolute", right: 0, top: 28, width: 300, background: "rgba(26,26,26,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `0.5px solid ${C.borderLight}`, borderRadius: 14, padding: "16px 18px", fontSize: 12, color: C.textDim, lineHeight: 1.6, zIndex: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.6)", fontFamily: "'Inter', -apple-system, sans-serif" }}>
                {info}
                <button onClick={() => setShowInfo(false)} style={{ display: "block", marginTop: 10, background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, padding: 0 }}>Close</button>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function TradeTableComponent({ trades, strategyTags, onSetStrategy }) {
  const [sortKey, setSortKey] = useState("idx");
  const [sortDir, setSortDir] = useState(1);
  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "buyDate" || sortKey === "sellDate") { va = new Date(va); vb = new Date(vb); }
      if (sortKey === "strategy") { va = strategyTags?.[`${a.symbol}_${a.buyDate}`] || ""; vb = strategyTags?.[`${b.symbol}_${b.buyDate}`] || ""; }
      if (va < vb) return -1 * sortDir;
      if (va > vb) return 1 * sortDir;
      return 0;
    });
  }, [trades, sortKey, sortDir, strategyTags]);
  const toggle = k => { if (sortKey === k) setSortDir(d => d * -1); else { setSortKey(k); setSortDir(-1); } };
  const th = { padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter', -apple-system, sans-serif", cursor: "pointer", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", background: C.surface, position: "sticky", top: 0, zIndex: 1 };
  const td = { padding: "8px 12px", fontSize: 12, fontFamily: "'Inter', -apple-system, sans-serif", borderBottom: `1px solid ${C.border}`, color: C.text, whiteSpace: "nowrap" };
  const cols = [["idx", "#"], ["symbol", "Sym"], ["strategy", "Strategy"], ["buyDate", "Entry"], ["sellDate", "Exit"], ["quantity", "Qty"], ["buyPrice", "Buy"], ["sellPrice", "Sell"], ["rMultiple", "R-Mult"], ["pnl", "P&L $"], ["pnlPercent", "%"], ["holdDays", "Days"]];
  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 520, borderRadius: 8, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1020 }}>
        <thead><tr>
          {cols.map(([k, l]) => (
            <th key={k} style={th} onClick={() => toggle(k)}>{l} {sortKey === k ? (sortDir > 0 ? "▲" : "▼") : ""}</th>
          ))}
        </tr></thead>
        <tbody>
          {sorted.map((t, i) => {
            const tradeKey = `${t.symbol}_${t.buyDate}`;
            const strategy = strategyTags?.[tradeKey] || "";
            return (
              <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.01)" : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.accent}08`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? "rgba(255,255,255,0.01)" : "transparent"}
              >
                <td style={{ ...td, color: C.textDim }}>{t.idx}</td>
                <td style={{ ...td, fontWeight: 700, color: C.accent }}>{t.symbol}</td>
                <td style={td}>
                  <select value={strategy} onChange={e => onSetStrategy(tradeKey, e.target.value)} style={{
                    padding: "3px 4px", background: strategy ? `${C.purple}18` : C.bgAlt, border: `1px solid ${strategy ? `${C.purple}40` : C.border}`,
                    borderRadius: 4, color: strategy ? C.purple : C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif",
                    fontWeight: strategy ? 600 : 400, outline: "none", cursor: "pointer", appearance: "auto",
                  }}>
                    <option value="">--</option>
                    {STRATEGY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={td}>{t.buyDate}</td>
                <td style={td}>{t.sellDate}</td>
                <td style={td}>{t.quantity}</td>
                <td style={td}>${t.buyPrice.toFixed(2)}</td>
                <td style={td}>${t.sellPrice.toFixed(2)}</td>
                <td style={{ ...td, fontWeight: 700, color: t.rMultiple >= 0 ? C.green : C.red, fontSize: 13 }}>
                  {t.rMultiple >= 0 ? "+" : ""}{t.rMultiple.toFixed(2)}R
                </td>
                <td style={{ ...td, color: t.pnl >= 0 ? C.green : C.red }}>
                  {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                </td>
                <td style={{ ...td, color: t.pnlPercent >= 0 ? C.green : C.red }}>
                  {t.pnlPercent >= 0 ? "+" : ""}{t.pnlPercent.toFixed(1)}%
                </td>
                <td style={td}>{t.holdDays}d</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const STRATEGY_OPTIONS = ["Breakout", "Mean Reversion", "Momentum", "Earnings Play", "Swing Trade", "Scalp", "Gap Fill", "Trend Follow", "Reversal", "Other"];

export default function TradeDashboard({ savedTrades, savedCashEvents, onSaveTrades, onClearTrades, onSettingsChange, initialSettings, user, onSignOut, onStatsChange }) {
  const [loaded, setLoaded] = useState(false);
  const [matched, setMatched] = useState([]);
  const [cashEvents, setCashEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("tharp");
  const [dragOver, setDragOver] = useState(false);
  const [riskPct, setRiskPct] = useState(initialSettings?.risk_percent || 1);
  const [accountSize, setAccountSize] = useState(initialSettings?.account_size || 100000);
  const [accountSizeInput, setAccountSizeInput] = useState(String(initialSettings?.account_size || 100000));
  const [startOverride, setStartOverride] = useState(null); // manual override for filtered period start
  const [saveStatus, setSaveStatus] = useState("");
  const [strategyTags, setStrategyTags] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aiedge_strategies") || localStorage.getItem("tradescope_strategies") || "{}"); } catch { return {}; }
  });
  const [filterStrategy, setFilterStrategy] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, ytd, 12mo, 3yr, custom
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [detectedBroker, setDetectedBroker] = useState("");
  const fileRef = useRef(null);

  // Broker connection state
  const [brokerStatus, setBrokerStatus] = useState(null); // { connected, accounts, lastSync }
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [brokerMsg, setBrokerMsg] = useState("");
  const [syncStartDate, setSyncStartDate] = useState("2020-01-01");
  const [syncEndDate, setSyncEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Persist strategy tags
  useEffect(() => {
    localStorage.setItem("aiedge_strategies", JSON.stringify(strategyTags));
  }, [strategyTags]);

  const setTradeStrategy = useCallback((tradeKey, strategy) => {
    setStrategyTags(prev => ({ ...prev, [tradeKey]: strategy }));
  }, []);

  // Load saved trades and cash events from DB on mount
  useEffect(() => {
    if (savedTrades && savedTrades.length > 0) {
      const m = matchTrades(savedTrades);
      if (m.length) {
        setMatched(m);
        setLoaded(true);
      }
    }
    if (savedCashEvents && savedCashEvents.length > 0) {
      setCashEvents(savedCashEvents);
    }
  }, []);

  // Check broker connection status on mount
  useEffect(() => {
    db.getBrokerStatus()
      .then(status => setBrokerStatus(status))
      .catch(() => setBrokerStatus(null));
  }, []);

  // Handle ?broker=connected callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('broker') === 'connected') {
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
      // Refresh broker status
      db.getBrokerStatus()
        .then(status => {
          setBrokerStatus(status);
          if (status?.connected) {
            setBrokerMsg('Broker connected! Click "Sync Trades" to import your trades.');
            setTimeout(() => setBrokerMsg(''), 5000);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleConnectBroker = useCallback(async () => {
    setBrokerLoading(true);
    setBrokerMsg('');
    try {
      const { redirectURI } = await db.connectBroker();
      if (redirectURI) {
        window.location.href = redirectURI;
      }
    } catch (err) {
      setBrokerMsg(err.message);
    }
    setBrokerLoading(false);
  }, []);

  const handleSyncTrades = useCallback(async () => {
    setSyncLoading(true);
    setBrokerMsg('');
    try {
      const result = await db.syncBrokerTrades(syncStartDate, syncEndDate);
      setBrokerMsg(result.message);
      // Reload trades and cash events from DB after sync
      if ((result.trades > 0 || result.cashEvents > 0) && user) {
        const [trades, loadedCashEvents] = await Promise.all([
          db.loadTrades(user.id),
          db.loadCashEvents(user.id),
        ]);
        const formatted = trades.map(t => ({
          date: t.date, symbol: t.symbol, description: t.description,
          action: t.action, quantity: Number(t.quantity), price: Number(t.price),
          commission: Number(t.commission), fees: Number(t.fees), amount: Number(t.amount),
        }));
        const m = matchTrades(formatted);
        if (m.length) {
          setMatched(m);
          setLoaded(true);
          setDetectedBroker("SnapTrade");
        }
        setCashEvents(loadedCashEvents.map(e => ({
          date: e.date, type: e.type, amount: Number(e.amount),
          symbol: e.symbol || null, description: e.description || '',
        })));
      }
      // Refresh status (includes totalBalance from SnapTrade)
      const status = await db.getBrokerStatus();
      // Prefer the balance from the status call, but keep sync result's balance as fallback
      if (result.totalBalance != null && status.totalBalance == null) {
        status.totalBalance = result.totalBalance;
      }
      setBrokerStatus(status);
      setTimeout(() => setBrokerMsg(''), 5000);
    } catch (err) {
      setBrokerMsg(err.message);
    }
    setSyncLoading(false);
  }, [user, syncStartDate, syncEndDate]);

  const handleDisconnectBroker = useCallback(async () => {
    if (!confirm('Disconnect your broker? Your imported trades will be kept.')) return;
    try {
      await db.disconnectBroker();
      setBrokerStatus({ connected: false, accounts: [] });
      setBrokerMsg('Broker disconnected.');
      setTimeout(() => setBrokerMsg(''), 3000);
    } catch (err) {
      setBrokerMsg(err.message);
    }
  }, []);

  const processCSV = useCallback((text) => {
    const { trades: parsed, cashEvents: parsedCashEvents, broker } = parseCSVAuto(text);
    if (!parsed.length) return false;
    setDetectedBroker(broker);
    const m = matchTrades(parsed);
    if (!m.length) return false;
    setMatched(m);
    setLoaded(true);
    // Save cash events (dividends, deposits, withdrawals, interest) to DB
    if (parsedCashEvents && parsedCashEvents.length > 0) {
      setCashEvents(prev => {
        const existing = new Set(prev.map(e => `${e.date}_${e.type}_${e.amount}_${e.symbol || ''}`));
        const merged = [...prev];
        for (const e of parsedCashEvents) {
          const key = `${e.date}_${e.type}_${e.amount}_${e.symbol || ''}`;
          if (!existing.has(key)) { merged.push(e); existing.add(key); }
        }
        return merged;
      });
      if (user) {
        db.saveCashEvents(user.id, parsedCashEvents).catch(err => console.error('Failed to save cash events:', err));
      }
    }
    if (onSaveTrades) {
      setSaveStatus("saving");
      onSaveTrades(parsed).then(() => setSaveStatus("saved")).catch(() => setSaveStatus("error"));
      setTimeout(() => setSaveStatus(""), 2500);
    }
    return true;
  }, [onSaveTrades, user]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!processCSV(e.target.result)) alert("Could not parse trades. Supported brokers: Fidelity, Schwab, E*TRADE, Robinhood, Interactive Brokers, Webull, Chase, Vanguard, Wells Fargo, Questrade, Alpaca, Wealthsimple, Trading212, DEGIRO, Public, Zerodha, Upstox, CommSec, Stake, Tradovate, AMP Futures, TradeLocker.");
    };
    reader.readAsText(file);
  }, [processCSV]);

  const riskPerTrade = (accountSize * riskPct) / 100;

  // Save settings to DB when they change
  useEffect(() => {
    if (onSettingsChange) {
      const timer = setTimeout(() => onSettingsChange(accountSize, riskPct), 500);
      return () => clearTimeout(timer);
    }
  }, [accountSize, riskPct, onSettingsChange]);

  // Compute the date range filter boundaries (shared between filteredMatched and effectiveStartSize)
  const dateFilterRange = useMemo(() => {
    const now = new Date();
    let from = null, to = null;
    if (dateFilter === "ytd") {
      from = new Date(now.getFullYear(), 0, 1);
    } else if (dateFilter === "12mo") {
      from = new Date(now); from.setFullYear(from.getFullYear() - 1);
    } else if (dateFilter === "3yr") {
      from = new Date(now); from.setFullYear(from.getFullYear() - 3);
    } else if (dateFilter === "custom") {
      if (customDateFrom) from = new Date(customDateFrom);
      if (customDateTo) to = new Date(customDateTo + "T23:59:59");
    }
    return { from, to };
  }, [dateFilter, customDateFrom, customDateTo]);

  const filteredMatched = useMemo(() => {
    if (!matched.length) return matched;
    const { from, to } = dateFilterRange;
    if (!from && !to) return matched;
    return matched.filter(t => {
      const d = new Date(t.sellDate);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [matched, dateFilterRange]);

  // When a date filter is active, compute the account balance at the start of the period.
  // If we have a real balance from SnapTrade, work BACKWARDS: currentBalance - P&L in period - cashEvents in period.
  // Otherwise fall back to the old forward approach: accountSize + P&L before period + cashEvents before period.
  const computedPeriodStart = useMemo(() => {
    const { from, to } = dateFilterRange;
    if (!from || (!matched.length && !cashEvents.length)) return accountSize;

    const realBalance = brokerStatus?.totalBalance;
    if (realBalance != null) {
      // Work backwards from the real current balance
      let inPeriodPnL = 0;
      for (const t of matched) {
        const d = new Date(t.sellDate);
        if (d >= from && (!to || d <= to)) inPeriodPnL += t.pnl;
      }
      let inPeriodCash = 0;
      for (const e of cashEvents) {
        const d = new Date(e.date);
        if (d >= from && (!to || d <= to)) inPeriodCash += e.amount;
      }
      // Also subtract P&L and cash events AFTER the filter window (if using a bounded range)
      let afterPeriodPnL = 0;
      let afterPeriodCash = 0;
      if (to) {
        for (const t of matched) {
          if (new Date(t.sellDate) > to) afterPeriodPnL += t.pnl;
        }
        for (const e of cashEvents) {
          if (new Date(e.date) > to) afterPeriodCash += e.amount;
        }
      }
      return Math.round((realBalance - inPeriodPnL - inPeriodCash - afterPeriodPnL - afterPeriodCash) * 100) / 100;
    }

    // Fallback: build forward from accountSize + everything before the period
    let running = accountSize;
    const sorted = [...matched].sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));
    for (const t of sorted) {
      if (new Date(t.sellDate) >= from) break;
      running += t.pnl;
    }
    if (cashEvents.length > 0) {
      const sortedEvents = [...cashEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
      for (const e of sortedEvents) {
        if (new Date(e.date) >= from) break;
        running += e.amount;
      }
    }
    return Math.round(running * 100) / 100;
  }, [matched, cashEvents, dateFilterRange, accountSize, brokerStatus]);

  const isFiltered = dateFilterRange.from !== null || dateFilterRange.to !== null;

  // Use manual override if set, otherwise use computed value
  const effectiveStartSize = startOverride !== null && isFiltered ? startOverride : computedPeriodStart;

  // When the filter changes, clear the manual override so it auto-computes
  useEffect(() => {
    setStartOverride(null);
  }, [dateFilter, customDateFrom, customDateTo]);

  const effectiveRiskPerTrade = (effectiveStartSize * riskPct) / 100;

  const stats = useMemo(() => {
    if (!filteredMatched.length) return null;

    // Sort trades chronologically — R must be calculated in order
    const sortedByDate = [...filteredMatched].sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));

    // Dynamic R: each trade's 1R is based on the account size at that point
    let runningAccount = effectiveStartSize;
    const rMultipleMap = new Map();
    const rMultiples = []; // in sortedByDate order
    for (const t of sortedByDate) {
      const dynamicR = (runningAccount * riskPct) / 100;
      const rm = Math.round((t.pnl / dynamicR) * 1000) / 1000;
      rMultiples.push(rm);
      rMultipleMap.set(t, rm);
      runningAccount += t.pnl;
    }
    const finalAccountSize = runningAccount;

    const winRm = rMultiples.filter(r => r > 0);
    const lossRm = rMultiples.filter(r => r <= 0);
    const n = rMultiples.length;
    const meanR = rMultiples.reduce((s, r) => s + r, 0) / n;
    const stdR = Math.sqrt(rMultiples.reduce((s, r) => s + Math.pow(r - meanR, 2), 0) / n);
    const sqn = stdR > 0 ? (meanR / stdR) * Math.sqrt(Math.min(n, 100)) : 0;
    const sqnRating = getSQNRating(sqn);
    const avgWinR = winRm.length ? winRm.reduce((s, r) => s + r, 0) / winRm.length : 0;
    const avgLossR = lossRm.length ? Math.abs(lossRm.reduce((s, r) => s + r, 0) / lossRm.length) : 0;
    const payoffRatio = avgLossR > 0 ? avgWinR / avgLossR : Infinity;
    const winRate = (winRm.length / n) * 100;
    const profitFactorR = Math.abs(lossRm.reduce((s, r) => s + r, 0)) > 0 ? winRm.reduce((s, r) => s + r, 0) / Math.abs(lossRm.reduce((s, r) => s + r, 0)) : Infinity;
    const expectancyRatio = stdR > 0 ? meanR / stdR : 0;
    const expRating = getExpRatioRating(expectancyRatio);
    const firstDate = new Date(sortedByDate[0].sellDate);
    const lastDate = new Date(sortedByDate[sortedByDate.length - 1].sellDate);
    const tradingDays = Math.max(1, Math.round((lastDate - firstDate) / 86400000));
    const tradingMonths = Math.max(1, tradingDays / 30.44);
    const tradesPerMonth = n / tradingMonths;
    const expectunity = meanR * tradesPerMonth;
    let cumR = 0;
    const cumRData = sortedByDate.map((t, i) => { cumR += rMultiples[i]; return { date: t.sellDate, cumR: Math.round(cumR * 100) / 100, trade: i + 1 }; });
    const totalR = Math.round(cumR * 100) / 100;
    let peakR = 0, maxDDR = 0, runCumR = 0;
    const ddRData = sortedByDate.map((t, i) => {
      runCumR += rMultiples[i];
      if (runCumR > peakR) peakR = runCumR;
      const dd = peakR - runCumR;
      if (dd > maxDDR) maxDDR = dd;
      return { date: t.sellDate, dd: -Math.round(dd * 100) / 100, trade: i + 1 };
    });
    const rMin = Math.floor(Math.min(...rMultiples));
    const rMax = Math.ceil(Math.max(...rMultiples));
    const bins = [];
    for (let b = rMin; b <= rMax; b++) {
      const count = rMultiples.filter(r => r >= b && r < b + 1).length;
      bins.push({ range: `${b >= 0 ? "+" : ""}${b}R`, rangeNum: b, count, isWin: b >= 0 });
    }
    let maxWS = 0, maxLS = 0, cW = 0, cL = 0;
    for (const r of rMultiples) { if (r > 0) { cW++; cL = 0; maxWS = Math.max(maxWS, cW); } else { cL++; cW = 0; maxLS = Math.max(maxLS, cL); } }
    const symbols = [...new Set(filteredMatched.map(t => t.symbol))];
    const bySymbol = symbols.map(sym => {
      const st = filteredMatched.filter(t => t.symbol === sym);
      const symR = st.map(t => rMultipleMap.get(t));
      const symTotalR = symR.reduce((s, r) => s + r, 0);
      return { symbol: sym, trades: st.length, totalR: Math.round(symTotalR * 100) / 100, avgR: Math.round((symTotalR / st.length) * 100) / 100, winRate: Math.round((symR.filter(r => r > 0).length / st.length) * 100), totalPnl: Math.round(st.reduce((s, t) => s + t.pnl, 0) * 100) / 100 };
    }).sort((a, b) => b.totalR - a.totalR);
    const monthly = {};
    for (let i = 0; i < sortedByDate.length; i++) {
      const d = new Date(sortedByDate[i].sellDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = { month: key, totalR: 0, trades: 0, wins: 0 };
      monthly[key].totalR += rMultiples[i];
      monthly[key].trades++;
      if (rMultiples[i] > 0) monthly[key].wins++;
    }
    const monthlyData = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
    monthlyData.forEach(m => { m.totalR = Math.round(m.totalR * 100) / 100; m.winRate = Math.round((m.wins / m.trades) * 100); });
    const tradeData = sortedByDate.map((t, i) => ({ ...t, rMultiple: Math.round(rMultiples[i] * 100) / 100, idx: i + 1 }));
    const sortedByR = [...tradeData].sort((a, b) => b.rMultiple - a.rMultiple);
    const totalPnL = filteredMatched.reduce((s, t) => s + t.pnl, 0);
    // Median R
    const sortedR = [...rMultiples].sort((a, b) => a - b);
    const medianR = n % 2 === 0 ? (sortedR[n / 2 - 1] + sortedR[n / 2]) / 2 : sortedR[Math.floor(n / 2)];
    // Skewness
    const skewness = n > 2 ? (n / ((n - 1) * (n - 2))) * rMultiples.reduce((s, r) => s + Math.pow((r - meanR) / stdR, 3), 0) : 0;
    // Kurtosis (excess)
    const kurtosis = n > 3 ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * rMultiples.reduce((s, r) => s + Math.pow((r - meanR) / stdR, 4), 0) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3)) : 0;

    return {
      n, rMultiples, meanR: Math.round(meanR * 1000) / 1000, stdR: Math.round(stdR * 1000) / 1000,
      sqn: Math.round(sqn * 100) / 100, sqnRating,
      avgWinR: Math.round(avgWinR * 100) / 100, avgLossR: Math.round(avgLossR * 100) / 100,
      payoffRatio: payoffRatio === Infinity ? "∞" : (Math.round(payoffRatio * 100) / 100).toFixed(2),
      winRate: Math.round(winRate * 10) / 10, wins: winRm.length, losses: lossRm.length,
      profitFactorR: profitFactorR === Infinity ? "∞" : (Math.round(profitFactorR * 100) / 100).toFixed(2),
      expectancyRatio: Math.round(expectancyRatio * 1000) / 1000, expRating,
      tradesPerMonth: Math.round(tradesPerMonth * 10) / 10,
      expectunity: Math.round(expectunity * 100) / 100,
      totalR, cumRData, ddRData, maxDDR: Math.round(maxDDR * 100) / 100,
      bins, maxWinStreak: maxWS, maxLossStreak: maxLS,
      bySymbol, monthlyData, tradeData,
      bestR: sortedByR[0], worstR: sortedByR[sortedByR.length - 1],
      largestWinR: Math.round(Math.max(...rMultiples) * 100) / 100,
      largestLossR: Math.round(Math.min(...rMultiples) * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      tradingDays, medianR: Math.round(medianR * 1000) / 1000,
      skewness: Math.round(skewness * 100) / 100,
      kurtosis: Math.round(kurtosis * 100) / 100,
      finalAccountSize: Math.round(finalAccountSize * 100) / 100,
    };
  }, [filteredMatched, effectiveStartSize, riskPct]);

  // Propagate stats to parent for Insights page
  useEffect(() => {
    if (onStatsChange) onStatsChange(stats);
  }, [stats, onStatsChange]);

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", color: C.text, overflow: "hidden" }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* ── Hero + Upload ── */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(32px, 6vh, 72px) 20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, letterSpacing: "-0.045em", marginBottom: 12, lineHeight: 1.05 }}>
              Import your trades.
            </h1>
            <p style={{ color: C.textDim, fontSize: "clamp(15px, 2vw, 17px)", maxWidth: 440, margin: "0 auto", lineHeight: 1.5, fontWeight: 400 }}>
              Connect your broker for automatic sync, or drop a CSV.
            </p>
          </div>

          {/* Upload + Sample side by side on desktop */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            {/* Drop zone */}
            <div style={{
              flex: "1 1 320px", maxWidth: 420,
              border: `1px solid ${dragOver ? "rgba(41,151,255,0.4)" : C.border}`, borderRadius: 24,
              padding: "clamp(32px, 5vw, 48px) clamp(20px, 4vw, 32px)", textAlign: "center", cursor: "pointer",
              background: dragOver ? "rgba(41,151,255,0.03)" : C.surface,
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
              boxShadow: dragOver ? "0 0 0 4px rgba(41,151,255,0.08)" : "none",
            }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(41,151,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Drop your CSV here</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 6, fontWeight: 400 }}>or click to browse</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                {["Fidelity", "Schwab", "IBKR", "Webull", "Tradovate", "AMP", "TradeLocker"].map(b => (
                  <span key={b} style={{ padding: "3px 9px", borderRadius: 980, fontSize: 9, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: C.textMuted, border: `0.5px solid ${C.border}` }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Sample + Config */}
            <div style={{ flex: "1 1 280px", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => processCSV(SAMPLE_CSV)} style={{
                width: "100%", padding: "18px 24px", border: `0.5px solid rgba(255,255,255,0.12)`, borderRadius: 16,
                background: C.surface, color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', -apple-system, sans-serif", transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                letterSpacing: "-0.01em", textAlign: "left",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,199,89,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
                  </div>
                  <div>
                    <div>Try with sample data</div>
                    <div style={{ fontSize: 11, color: C.textDim, fontWeight: 400, marginTop: 2 }}>20 trades · Fidelity format</div>
                  </div>
                </div>
              </button>

              <div style={{ padding: "16px 18px", background: C.surface, borderRadius: 16, border: `0.5px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>R-value configuration</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>Starting Account Size ($)</label>
                    <input type="number" value={accountSizeInput} onChange={e => { setAccountSizeInput(e.target.value); const v = Number(e.target.value); if (v > 0) setAccountSize(v); }} onBlur={() => { if (!Number(accountSizeInput)) { setAccountSizeInput(String(accountSize)); } }} style={{ width: "100%", padding: "8px 10px", background: C.bgAlt, border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 4 }}>Risk per Trade (%)</label>
                    <input type="number" value={riskPct} step="0.25" onChange={e => setRiskPct(Number(e.target.value) || 1)} style={{ width: "100%", padding: "8px 10px", background: C.bgAlt, border: `0.5px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>Starting 1R = ${riskPerTrade.toLocaleString()} · R adjusts dynamically with account growth</div>
              </div>
            </div>
          </div>

          {/* ── Connect Broker ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              Or connect your broker
            </div>
            <div style={{
              maxWidth: 540, margin: "0 auto",
              background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 20,
              padding: "24px 28px",
            }}>
              {brokerStatus?.connected ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Broker Connected</span>
                  </div>
                  {brokerStatus.accounts?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                      {brokerStatus.accounts.map(a => (
                        <span key={a.id} style={{
                          padding: "4px 12px", borderRadius: 980, fontSize: 11, fontWeight: 500,
                          background: "rgba(52,199,89,0.08)", color: C.green, border: `0.5px solid rgba(52,199,89,0.15)`,
                        }}>{a.institution} — {a.name || a.number}</span>
                      ))}
                    </div>
                  )}
                  {brokerStatus.lastSync && (
                    <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14 }}>
                      Last synced: {new Date(brokerStatus.lastSync).toLocaleString()}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={handleSyncTrades} disabled={syncLoading} style={{
                      flex: 1, padding: "12px 20px", border: "none", borderRadius: 12,
                      background: C.accent, color: "white", fontSize: 14, fontWeight: 600,
                      cursor: syncLoading ? "wait" : "pointer", fontFamily: "inherit",
                      opacity: syncLoading ? 0.6 : 1, transition: "opacity 0.2s",
                    }}>
                      {syncLoading ? "Syncing..." : "Sync Trades"}
                    </button>
                    <button onClick={handleConnectBroker} disabled={brokerLoading} style={{
                      padding: "12px 20px", border: `0.5px solid ${C.border}`, borderRadius: 12,
                      background: "transparent", color: C.textDim, fontSize: 14, fontWeight: 500,
                      cursor: brokerLoading ? "wait" : "pointer", fontFamily: "inherit",
                    }}>
                      {brokerLoading ? "..." : "Add Account"}
                    </button>
                    <button onClick={handleDisconnectBroker} style={{
                      padding: "12px 16px", border: `0.5px solid rgba(255,59,48,0.2)`, borderRadius: 12,
                      background: "transparent", color: C.red, fontSize: 12, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Disconnect</button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(52,199,89,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 6 }}>Connect your brokerage</div>
                  <div style={{ fontSize: 13, color: C.textDim, marginBottom: 20, lineHeight: 1.5 }}>
                    Automatically sync trades from your broker. No more CSV uploads.
                  </div>
                  <button onClick={handleConnectBroker} disabled={brokerLoading} style={{
                    padding: "12px 28px", border: "none", borderRadius: 12,
                    background: C.green, color: "white", fontSize: 15, fontWeight: 600,
                    cursor: brokerLoading ? "wait" : "pointer", fontFamily: "inherit",
                    opacity: brokerLoading ? 0.6 : 1, transition: "opacity 0.2s",
                  }}>
                    {brokerLoading ? "Connecting..." : "Connect Broker"}
                  </button>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                    {["Fidelity", "Schwab", "E*TRADE", "Robinhood", "IBKR", "Webull", "Chase", "Vanguard", "Wells Fargo", "Questrade", "Alpaca", "Wealthsimple", "Trading212", "DEGIRO", "Public", "Zerodha", "CommSec", "Stake"].map(b => (
                      <span key={b} style={{ padding: "3px 9px", borderRadius: 980, fontSize: 9, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: C.textMuted, border: `0.5px solid ${C.border}` }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {brokerMsg && (
                <div style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                  background: brokerMsg.toLowerCase().includes("error") || brokerMsg.toLowerCase().includes("fail")
                    ? "rgba(255,59,48,0.08)" : "rgba(52,199,89,0.08)",
                  color: brokerMsg.toLowerCase().includes("error") || brokerMsg.toLowerCase().includes("fail")
                    ? C.red : C.green,
                }}>{brokerMsg}</div>
              )}
            </div>
          </div>

          {/* ── What you'll see ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>
              What you'll see
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))", gap: 10 }}>
              {[
                { label: "SQN", value: "3.42", badge: "Excellent", c: C.green },
                { label: "Expectancy", value: "+0.38R", c: C.green },
                { label: "Win Rate", value: "65.0%", c: C.text },
                { label: "Profit Factor", value: "2.14", c: C.green },
                { label: "Payoff Ratio", value: "1.72", c: C.green },
                { label: "Max Drawdown", value: "2.1R", c: C.yellow },
                { label: "Expectunity", value: "+2.1R/mo", c: C.accent },
                { label: "R Skewness", value: "+0.46", c: C.green },
              ].map(m => (
                <div key={m.label} style={{
                  background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 16,
                  padding: "16px 18px", opacity: 0.5,
                }}>
                  <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: m.c, letterSpacing: "-0.03em" }}>{m.value}</span>
                    {m.badge && <span style={{ fontSize: 9, fontWeight: 600, color: m.c, padding: "2px 8px", borderRadius: 980, background: `${m.c}12` }}>{m.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── How it works ── */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
              How it works
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 16 }}>
              {[
                { step: "1", title: "Export your trades", desc: "Download a CSV from your broker's trade history or account activity page.", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" },
                { step: "2", title: "Drop it here", desc: "We auto-detect your broker format. No column mapping or configuration needed.", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" },
                { step: "3", title: "See your edge", desc: "SQN, R-multiples, expectancy, equity curves, and 20+ Van Tharp metrics instantly.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
              ].map(s => (
                <div key={s.step} style={{
                  background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`,
                  padding: "24px 22px", textAlign: "center",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, margin: "0 auto 14px",
                    background: "rgba(41,151,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, fontWeight: 400 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Metrics list ── */}
          <div style={{ textAlign: "center", paddingBottom: 60 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              20+ Van Tharp metrics
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", maxWidth: 640, margin: "0 auto" }}>
              {["SQN", "Expectancy", "Expectunity", "R-Multiples", "Win Rate", "Profit Factor", "Payoff Ratio", "Max Drawdown", "Equity Curve", "R-Distribution", "Skewness", "Kurtosis", "By Symbol", "By Day of Week", "Holding Period", "Monthly R", "Win/Loss Streaks", "Strategy Tags"].map(m => (
                <span key={m} style={{
                  padding: "6px 14px", borderRadius: 980, fontSize: 12, fontWeight: 500,
                  background: "rgba(255,255,255,0.03)", color: C.textDim,
                  border: `0.5px solid ${C.border}`,
                }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "tharp", label: "Van Tharp" },
    { id: "rmultiples", label: "R-Multiples" },
    { id: "trades", label: "Trade Log" },
    { id: "symbols", label: "By Symbol" },
    { id: "timing", label: "Timing" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Date Filter Bar ── */}
      {loaded && (
        <div style={{ padding: "16px 16px 0", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: C.surface, borderRadius: 12, padding: "10px 14px", border: `1px solid ${C.borderLight}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginRight: 4 }}>Period</span>
            {[
              { id: "all", label: "All Time" },
              { id: "ytd", label: "YTD" },
              { id: "12mo", label: "1 Year" },
              { id: "3yr", label: "3 Years" },
              { id: "custom", label: "Custom" },
            ].map(f => (
              <button key={f.id} onClick={() => setDateFilter(f.id)} style={{
                padding: "6px 14px", border: `1px solid ${dateFilter === f.id ? C.accent : C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                background: dateFilter === f.id ? `${C.accent}22` : "rgba(255,255,255,0.03)",
                color: dateFilter === f.id ? C.accent : C.textDim,
                transition: "all 0.2s",
              }}>{f.label}</button>
            ))}
            {dateFilter === "custom" && (
              <>
                <input type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)} style={{
                  padding: "5px 8px", background: "transparent", border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none",
                  colorScheme: "dark",
                }} />
                <span style={{ fontSize: 11, color: C.textDim }}>to</span>
                <input type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)} style={{
                  padding: "5px 8px", background: "transparent", border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none",
                  colorScheme: "dark",
                }} />
              </>
            )}
            <span style={{ marginLeft: "auto", fontSize: 11, color: dateFilter !== "all" ? C.accent : C.textDim, fontWeight: 500 }}>
              {dateFilter !== "all" ? `Showing ${filteredMatched.length} of ${matched.length} trades` : `${matched.length} trades`}
            </span>
          </div>
        </div>
      )}

      {/* ── Hero summary ── */}
      {stats && (
        <div style={{ padding: "28px 16px 0", maxWidth: 1320, margin: "0 auto" }}>
          <div className="dash-hero" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 24, marginBottom: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>System Quality Number</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span className="dash-hero-sqn" style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.05em", color: stats.sqnRating.color, lineHeight: 1 }}>{stats.sqn.toFixed(2)}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: stats.sqnRating.color, padding: "5px 16px", borderRadius: 980, background: `${stats.sqnRating.color}12` }}>{stats.sqnRating.label}</span>
              </div>
            </div>
            <div className="dash-hero-stats" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { l: "Expectancy", v: `${stats.meanR >= 0 ? "+" : ""}${stats.meanR.toFixed(3)}R`, c: stats.meanR >= 0 ? C.green : C.red },
                { l: "Win Rate", v: `${stats.winRate}%`, c: stats.winRate >= 50 ? C.green : C.red },
                { l: "Total R", v: `${stats.totalR >= 0 ? "+" : ""}${stats.totalR}R`, c: stats.totalR >= 0 ? C.green : C.red },
                { l: "Trades", v: stats.n, c: C.text },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.c, letterSpacing: "-0.03em" }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: "0.5px", background: C.border, margin: "20px 0 0" }} />
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="dash-toolbar" style={{ padding: "16px 16px 0", maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        {/* Tabs */}
        <div className="dash-tabs" style={{ display: "inline-flex", gap: 2, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 18px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif",
              background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === tab.id ? C.text : C.textMuted,
              transition: "all 0.2s ease", letterSpacing: "-0.01em",
            }}>{tab.label}</button>
          ))}
        </div>
        {/* Controls */}
        <div className="dash-controls" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "6px 12px" }}>
            <label style={{ fontSize: 10, color: C.textMuted }}>{isFiltered ? "Period start" : "Start"}</label>
            {isFiltered ? (
              <input type="number" value={startOverride !== null ? startOverride : effectiveStartSize} onChange={e => { const v = Number(e.target.value); setStartOverride(v > 0 ? v : null); }} onBlur={() => { if (startOverride !== null && startOverride <= 0) setStartOverride(null); }} style={{ width: 85, padding: "4px 6px", background: "transparent", border: `0.5px solid ${C.cyan}44`, borderRadius: 6, color: C.cyan, fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none" }} />
            ) : (
              <input type="number" value={accountSizeInput} onChange={e => { setAccountSizeInput(e.target.value); const v = Number(e.target.value); if (v > 0) setAccountSize(v); }} onBlur={() => { if (!Number(accountSizeInput)) { setAccountSizeInput(String(accountSize)); } }} style={{ width: 72, padding: "4px 6px", background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none" }} />
            )}
            <label style={{ fontSize: 10, color: C.textMuted }}>Risk</label>
            <input type="number" value={riskPct} step="0.25" onChange={e => setRiskPct(Number(e.target.value) || 1)} style={{ width: 44, padding: "4px 6px", background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none" }} />
            <span style={{ fontSize: 10, color: C.textDim }}>1R=${effectiveRiskPerTrade.toLocaleString()}</span>
            {stats?.finalAccountSize && <span style={{ fontSize: 10, color: C.green }}>Now ${stats.finalAccountSize.toLocaleString()}</span>}
          </div>
          {saveStatus === "saving" && <span style={{ fontSize: 10, color: C.yellow }}>Saving...</span>}
          {saveStatus === "saved" && <span style={{ fontSize: 10, color: C.green }}>Saved</span>}
          {saveStatus === "error" && <span style={{ fontSize: 10, color: C.red }}>Save failed</span>}
          <button onClick={() => { setLoaded(false); setMatched([]); setCashEvents([]); }} style={{ padding: "6px 14px", border: `0.5px solid ${C.border}`, borderRadius: 10, background: "transparent", color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >New Import</button>
          {brokerStatus?.connected && (
            <button onClick={handleSyncTrades} disabled={syncLoading} style={{
              padding: "6px 14px", border: `0.5px solid rgba(52,199,89,0.3)`, borderRadius: 10,
              background: "transparent", color: C.green, fontSize: 11, cursor: syncLoading ? "wait" : "pointer",
              fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, transition: "all 0.2s",
              opacity: syncLoading ? 0.6 : 1,
            }}>{syncLoading ? "Syncing..." : "Sync Broker"}</button>
          )}
          {onClearTrades && <button onClick={async () => { if (confirm("Delete all saved trades from the database?")) { await onClearTrades(); setLoaded(false); setMatched([]); setCashEvents([]); }}} style={{ padding: "6px 14px", border: `0.5px solid rgba(255,59,48,0.2)`, borderRadius: 10, background: "transparent", color: C.red, fontSize: 11, cursor: "pointer", fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500 }}>Clear</button>}
        </div>
      </div>

      <div className="dash-content" style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 16px" }}>

        {activeTab === "tharp" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="stagger metric-grid-lg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
              <MetricCard accent label="System Quality Number (SQN®)" value={stats.sqn.toFixed(2)} color={stats.sqnRating.color} rating={stats.sqnRating.label} ratingColor={stats.sqnRating.color} sub="√min(n,100) × (Mean R / Std R)" />
              <MetricCard label="Expectancy (Mean R)" value={`${stats.meanR >= 0 ? "+" : ""}${stats.meanR.toFixed(3)}R`} color={stats.meanR >= 0 ? C.green : C.red} sub="Avg profit per trade in risk units" />
              <MetricCard label="Expectancy Ratio" value={stats.expectancyRatio.toFixed(3)} color={stats.expRating.color} rating={stats.expRating.label} ratingColor={stats.expRating.color} sub="Mean R / Std Dev R (quality w/o n)" />
              <MetricCard label="Expectunity" value={`${stats.expectunity >= 0 ? "+" : ""}${stats.expectunity.toFixed(2)}R / mo`} color={stats.expectunity >= 0 ? C.green : C.red} sub={`Expectancy × ${stats.tradesPerMonth} trades/mo`} />
              <MetricCard label="Payoff Ratio" value={stats.payoffRatio} color={parseFloat(stats.payoffRatio) >= 1.5 ? C.green : C.yellow} sub={`Avg Win ${stats.avgWinR}R / Avg Loss ${stats.avgLossR}R`} />
              <MetricCard label="Profit Factor (R)" value={stats.profitFactorR} color={parseFloat(stats.profitFactorR) >= 1.5 ? C.green : C.yellow} sub="Σ Winning R / |Σ Losing R|" />
            </div>
            <div className="stagger metric-grid-sm" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 10 }}>
              <MetricCard small label="Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? C.green : C.red} sub={`${stats.wins}W / ${stats.losses}L`} />
              <MetricCard small label="Total R Earned" value={`${stats.totalR >= 0 ? "+" : ""}${stats.totalR}R`} color={stats.totalR >= 0 ? C.green : C.red} sub={`$${stats.totalPnL.toLocaleString()}`} />
              <MetricCard small label="Max Drawdown (R)" value={`${stats.maxDDR}R`} color={stats.maxDDR > 5 ? C.red : C.yellow} sub={`$${Math.round(stats.maxDDR * (isFiltered ? effectiveRiskPerTrade : riskPerTrade)).toLocaleString()}`} />
              <MetricCard small label="Std Dev of R" value={`${stats.stdR}R`} color={C.text} sub="Consistency" />
              <MetricCard small label="Median R" value={`${stats.medianR >= 0 ? "+" : ""}${stats.medianR}R`} color={stats.medianR >= 0 ? C.green : C.red} sub="Middle trade result" />
              <MetricCard small label="R Skewness" value={stats.skewness.toFixed(2)} color={stats.skewness > 0 ? C.green : C.red} sub={stats.skewness > 0 ? "Right-skewed (good)" : "Left-skewed"} />
              <MetricCard small label="R Kurtosis" value={stats.kurtosis.toFixed(2)} color={C.text} sub={stats.kurtosis > 0 ? "Fat tails" : "Thin tails"} />
              <MetricCard small label="Largest Win" value={`+${stats.largestWinR}R`} color={C.green} sub={stats.bestR?.symbol} />
              <MetricCard small label="Largest Loss" value={`${stats.largestLossR}R`} color={C.red} sub={stats.worstR?.symbol} />
              <MetricCard small label="Win Streak" value={stats.maxWinStreak} color={C.green} sub="Consecutive" />
              <MetricCard small label="Loss Streak" value={stats.maxLossStreak} color={C.red} sub="Consecutive" />
              <MetricCard small label="Opportunity" value={`${stats.tradesPerMonth}/mo`} color={C.cyan} sub={`${stats.n} trades total`} />
              <MetricCard small label="Sample Size" value={stats.n} color={C.text} sub={stats.n < 30 ? "⚠ Low (<30)" : stats.n < 100 ? "Moderate" : "Good (100+)"} />
            </div>

            <ChartBox title="SQN® Quality Scale" info="Van Tharp's System Quality Number: <1.5 Difficult · 1.5-2 Average · 2-3 Good · 3-5 Excellent · 5-7 Superb · 7+ Holy Grail. SQN = (Mean R / Std R) × √min(n,100).">
              <div style={{ padding: "8px 0 12px" }}>
                <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", position: "relative", marginBottom: 8 }}>
                  {[{ max: 1.5, label: "<1.5 Hard", c: C.red }, { max: 2, label: "1.5-2 Avg", c: C.orange }, { max: 3, label: "2-3 Good", c: C.yellow }, { max: 5, label: "3-5 Excellent", c: C.green }, { max: 7, label: "5-7 Superb", c: C.accent }, { max: 10, label: "7+ Grail", c: C.cyan }].map((seg, i, arr) => (
                    <div key={i} style={{ flex: seg.max - (i === 0 ? 0 : arr[i - 1].max), background: `${seg.c}30`, borderRight: `1px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 8, color: seg.c, fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{seg.label}</span>
                    </div>
                  ))}
                  <div style={{ position: "absolute", top: -4, bottom: -4, left: `${Math.min(95, Math.max(2, (stats.sqn / 10) * 100))}%`, width: 3, background: C.white, borderRadius: 2, boxShadow: `0 0 8px ${C.white}80`, transition: "left 0.3s" }} />
                </div>
                <div style={{ fontSize: 12, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif", textAlign: "center" }}>
                  Your SQN: <strong style={{ color: stats.sqnRating.color }}>{stats.sqn.toFixed(2)}</strong> — {stats.sqnRating.label}
                </div>
              </div>
            </ChartBox>

            <ChartBox title="Cumulative R (Equity Curve in Risk Units)" info="Total accumulated R-multiples over time. A steadily rising curve = consistent edge independent of position sizing.">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.cumRData}>
                  <defs><linearGradient id="cumRGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.15} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="trade" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} label={{ value: "Trade #", position: "insideBottomRight", offset: -5, style: { fontSize: 10, fill: C.textDim, fontFamily: "'Inter', -apple-system, sans-serif" } }} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Area type="monotone" dataKey="cumR" stroke={C.accent} strokeWidth={2} fill="url(#cumRGrad)" name="Cumulative R" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Drawdown in R" info="Peak-to-trough decline in R-multiples. Max DD in R tells you the worst equity decline in risk units.">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.ddRData}>
                  <defs><linearGradient id="ddRGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.15} /><stop offset="95%" stopColor={C.red} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="trade" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Area type="monotone" dataKey="dd" stroke={C.red} strokeWidth={1.5} fill="url(#ddRGrad)" name="Drawdown" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        )}

        {activeTab === "rmultiples" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ChartBox title="R-Multiple Distribution" info="Core Van Tharp visualization. Healthy systems show losses clustered near -1R (disciplined stops) and a long right tail of winners.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.bins}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="range" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} label={{ value: "Trades", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: C.textDim, fontFamily: "'Inter', -apple-system, sans-serif" } }} />
                  <Tooltip content={<TT formatter={v => `${v} trades`} />} />
                  <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]}>
                    {stats.bins.map((b, i) => <Cell key={i} fill={b.isWin ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="R-Multiple per Trade (Waterfall)" info="Each bar = one trade's R-multiple. Green = winner, Red = loser. Look for controlled losses near -1R.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.tradeData.map((t, i) => ({ name: `#${i + 1}`, r: t.rMultiple, sym: t.symbol }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 8, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} interval={Math.max(0, Math.floor(stats.n / 20))} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="r" name="R-Multiple" radius={[3, 3, 0, 0]}>
                    {stats.tradeData.map((t, i) => <Cell key={i} fill={t.rMultiple >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Monthly R Earned" info="Total R-multiples per month. Consistent monthly R = tradable system.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} />
                  <YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="totalR" name="Monthly R" radius={[4, 4, 0, 0]}>
                    {stats.monthlyData.map((m, i) => <Cell key={i} fill={m.totalR >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              <MetricCard small label="Mean R (Expectancy)" value={`${stats.meanR >= 0 ? "+" : ""}${stats.meanR}R`} color={stats.meanR >= 0 ? C.green : C.red} />
              <MetricCard small label="Median R" value={`${stats.medianR >= 0 ? "+" : ""}${stats.medianR}R`} color={stats.medianR >= 0 ? C.green : C.red} />
              <MetricCard small label="Std Dev of R" value={`${stats.stdR}R`} color={C.text} sub="Lower = more consistent" />
              <MetricCard small label="Avg Winning R" value={`+${stats.avgWinR}R`} color={C.green} sub={`${stats.wins} winners`} />
              <MetricCard small label="Avg Losing R" value={`-${stats.avgLossR}R`} color={C.red} sub={`${stats.losses} losers`} />
              <MetricCard small label="Skewness" value={stats.skewness.toFixed(2)} color={stats.skewness > 0 ? C.green : C.red} sub={stats.skewness > 0 ? "Positive skew (good)" : "Negative skew"} />
            </div>
          </div>
        )}

        {activeTab === "trades" && stats && (() => {
          const filteredTrades = filterStrategy
            ? stats.tradeData.filter(t => strategyTags[`${t.symbol}_${t.buyDate}`] === filterStrategy)
            : stats.tradeData;
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'Inter', -apple-system, sans-serif" }}>
                  {filteredTrades.length} {filterStrategy ? "filtered" : "closed"} trades · 1R = ${(isFiltered ? effectiveRiskPerTrade : riskPerTrade).toLocaleString()}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <label style={{ fontSize: 10, color: C.textMuted, fontFamily: "'Inter', -apple-system, sans-serif" }}>Strategy:</label>
                  <select value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)} style={{
                    padding: "4px 8px", background: C.bgAlt, border: `1px solid ${C.border}`,
                    borderRadius: 4, color: C.text, fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif", outline: "none", appearance: "auto",
                  }}>
                    <option value="">All</option>
                    {STRATEGY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <TradeTableComponent trades={filteredTrades} strategyTags={strategyTags} onSetStrategy={setTradeStrategy} />
            </div>
          );
        })()}

        {activeTab === "symbols" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {stats.bySymbol.map(s => (
                <div key={s.symbol} className="card-hover" style={{
                  background: C.surface, borderRadius: 20, border: `0.5px solid ${C.border}`,
                  padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: C.accent, letterSpacing: "-0.02em" }}>{s.symbol}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{s.trades} trades · {s.winRate}% win rate</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.totalR >= 0 ? C.green : C.red, letterSpacing: "-0.03em" }}>{s.totalR >= 0 ? "+" : ""}{s.totalR}R</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>avg {s.avgR}R · ${s.totalPnl.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <ChartBox title="Total R by Symbol">
              <ResponsiveContainer width="100%" height={Math.max(200, stats.bySymbol.length * 36)}>
                <BarChart data={stats.bySymbol} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} />
                  <YAxis dataKey="symbol" type="category" tick={{ fill: C.accent, fontSize: 11, fontWeight: 600, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} width={55} />
                  <ReferenceLine x={0} stroke={C.textMuted} strokeDasharray="3 3" />
                  <Tooltip content={<TT formatter={v => `${v}R`} />} />
                  <Bar dataKey="totalR" name="Total R" radius={[0, 4, 4, 0]}>
                    {stats.bySymbol.map((s, i) => <Cell key={i} fill={s.totalR >= 0 ? C.greenBar : C.redBar} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>
        )}

        {activeTab === "timing" && stats && (() => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const byDay = Array(7).fill(null).map((_, i) => ({ day: dayNames[i], totalR: 0, count: 0 }));
          stats.tradeData.forEach(t => { const d = new Date(t.sellDate).getDay(); byDay[d].totalR += t.rMultiple; byDay[d].count++; });
          const dayData = byDay.filter(d => d.count > 0).map(d => ({ ...d, totalR: Math.round(d.totalR * 100) / 100 }));
          const avgHold = Math.round(stats.tradeData.reduce((s, t) => s + t.holdDays, 0) / stats.n * 10) / 10;
          const holdData = stats.tradeData.map(t => ({ hold: t.holdDays, r: t.rMultiple, sym: t.symbol }));
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                <MetricCard small label="Avg Holding Period" value={`${avgHold} days`} color={C.cyan} />
                <MetricCard small label="Trades / Month" value={stats.tradesPerMonth} color={C.cyan} sub="Opportunity factor" />
                <MetricCard small label="Max Win Streak" value={stats.maxWinStreak} color={C.green} />
                <MetricCard small label="Max Loss Streak" value={stats.maxLossStreak} color={C.red} />
              </div>
              <ChartBox title="R by Day of Week" info="Total R earned by exit day. Identify your best/worst trading days.">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="day" tick={{ fill: C.textMuted, fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} /><YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} /><ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" /><Tooltip content={<TT formatter={v => `${v}R`} />} />
                    <Bar dataKey="totalR" name="Total R" radius={[4, 4, 0, 0]}>{dayData.map((d, i) => <Cell key={i} fill={d.totalR >= 0 ? C.greenBar : C.redBar} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
              <ChartBox title="Monthly Win Rate vs Trade Count" info="Opportunity (frequency) × Expectancy = total return. Van Tharp calls this Expectunity.">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} /><YAxis yAxisId="left" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}%`} /><YAxis yAxisId="right" orientation="right" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} /><Tooltip content={<TT />} /><Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Inter', -apple-system, sans-serif" }} />
                    <Bar yAxisId="right" dataKey="trades" name="Trades" fill={`${C.purple}40`} radius={[4, 4, 0, 0]} /><Line yAxisId="left" dataKey="winRate" name="Win %" stroke={C.accent} strokeWidth={2} dot={{ r: 3, fill: C.accent }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartBox>
              <ChartBox title="Holding Period vs R-Multiple" info="Do your best trades come from quick flips or patient holds? Scatter of days held vs R outcome.">
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={holdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="hold" tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} label={{ value: "Days Held", position: "insideBottomRight", offset: -5, style: { fontSize: 10, fill: C.textDim } }} /><YAxis tick={{ fill: C.textMuted, fontSize: 10, fontFamily: "'Inter', -apple-system, sans-serif" }} stroke={C.border} tickFormatter={v => `${v}R`} /><ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="3 3" /><Tooltip content={<TT formatter={v => `${v}R`} />} />
                    <Scatter dataKey="r" name="R-Multiple" fill={C.accent}>{holdData.map((d, i) => <Cell key={i} fill={d.r >= 0 ? C.green : C.red} />)}</Scatter>
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
