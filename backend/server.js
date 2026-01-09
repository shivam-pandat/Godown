// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");
const { sign, verify } = require("./auth");
const excelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const { create } = require("xmlbuilder2");

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter (Ethereal or your SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// -----------------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------------
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, hash],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Username already exists" });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err || !user)
        return res.status(401).json({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Incorrect password" });

      res.json({ token: sign(user) });
    }
  );
});

// Middleware check token
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing or invalid token" });

  const token = header.split(" ")[1];
  const payload = verify(token);

  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.user = payload;
  next();
}

// -----------------------------------------------------------
// STOCK CRUD
// -----------------------------------------------------------
app.get("/stock", (req, res) => {
  db.all("SELECT * FROM stock", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

app.post("/stock", authMiddleware, (req, res) => {
  const { name, quantity, unit, low_threshold, barcode } = req.body;

  db.run(
    "INSERT INTO stock (name, quantity, unit, low_threshold, barcode) VALUES (?, ?, ?, ?, ?)",
    [name, quantity, unit, low_threshold || 0, barcode || null],
    function (err) {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: this.lastID });
    }
  );
});

app.put("/stock/:id", authMiddleware, (req, res) => {
  const { quantity, low_threshold } = req.body;
  const id = req.params.id;

  db.run(
    "UPDATE stock SET quantity=?, low_threshold=? WHERE id=?",
    [quantity, low_threshold, id],
    function (err) {
      if (err) return res.status(500).json({ error: err });
      res.json({ updated: this.changes });
    }
  );
});

app.delete("/stock/:id", authMiddleware, (req, res) => {
  db.run("DELETE FROM stock WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err });
    res.json({ deleted: this.changes });
  });
});

// -----------------------------------------------------------
// BARCODE SCAN — UPDATE STOCK AUTOMATICALLY
// -----------------------------------------------------------
app.post("/stock/scan", authMiddleware, (req, res) => {
  const { barcode, change } = req.body; // change = +1 or -1

  db.get("SELECT * FROM stock WHERE barcode = ?", [barcode], (err, row) => {
    if (err) return res.status(500).json({ error: err });
    if (!row) return res.status(404).json({ error: "Item not found" });

    const newQty = row.quantity + Number(change);

    db.run(
      "UPDATE stock SET quantity=? WHERE id=?",
      [newQty, row.id],
      function (err) {
        if (err) return res.status(500).json({ error: err });

        res.json({ id: row.id, newQuantity: newQty });
      }
    );
  });
});

// -----------------------------------------------------------
// EXPORT EXCEL
// -----------------------------------------------------------
app.get("/export/excel", authMiddleware, async (req, res) => {
  db.all("SELECT * FROM stock", [], async (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const workbook = new excelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 30 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Low Threshold", key: "low_threshold", width: 15 },
      { header: "Barcode", key: "barcode", width: 20 },
    ];

    rows.forEach((r) => sheet.addRow(r));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=stock.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  });
});

// -----------------------------------------------------------
// EXPORT PDF
// -----------------------------------------------------------
app.get("/export/pdf", authMiddleware, (req, res) => {
  db.all("SELECT * FROM stock", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=stock.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Stock Report");
    doc.moveDown();

    rows.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `${r.id} — ${r.name} — Qty: ${r.quantity} ${r.unit} — Low: ${r.low_threshold}`
        );
    });

    doc.end();
  });
});

// -----------------------------------------------------------
// EXPORT TO TALLY (XML)
// -----------------------------------------------------------
app.get("/export/tally", authMiddleware, (req, res) => {
  db.all("SELECT * FROM stock", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const root = create({ version: "1.0" })
      .ele("ENVELOPE")
      .ele("HEADER")
      .ele("TALLYREQUEST")
      .txt("Import Data")
      .up()
      .up()
      .ele("BODY")
      .ele("IMPORTDATA")
      .ele("REQUESTDATA");

    rows.forEach((r) => {
      const msg = root.ele("TALLYMESSAGE");
      const item = msg.ele("STOCKITEM");

      item.ele("NAME").txt(r.name);
      item.ele("OPENINGBALANCE").txt(r.quantity);
      item.ele("BASEUNITS").txt(r.unit || "Nos");
      item.ele("BARCODE").txt(r.barcode || "");
    });

    const xml = root.end({ prettyPrint: true });

    res.setHeader("Content-Type", "application/xml");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock_tally.xml"
    );
    res.send(xml);
  });
});

// -----------------------------------------------------------
// LOW STOCK EMAIL CHECK
// -----------------------------------------------------------
function checkLowStock() {
  db.all(
    "SELECT * FROM stock WHERE quantity <= low_threshold AND low_threshold > 0",
    [],
    (err, rows) => {
      if (err) return;

      if (!rows.length) return;

      const msg = rows
        .map((r) => `${r.name}: ${r.quantity} (threshold ${r.low_threshold})`)
        .join("\n");

      const mail = {
        from: process.env.SMTP_FROM,
        to: process.env.NOTIFY_TO,
        subject: "Low Stock Alert",
        text: msg,
      };

      transporter.sendMail(mail, (err) => {
        if (err) console.log("Email failed:", err.message);
        else console.log("Low stock email sent.");
      });
    }
  );
}

// every 10 mins
setInterval(checkLowStock, 10 * 60 * 1000);

app.post("/check-low-stock", authMiddleware, (req, res) => {
  checkLowStock();
  res.json({ ok: true });
});

// -----------------------------------------------------------
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
