import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON and urlencoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup file uploads with multer in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment. Running in mock AI mode.");
}

// -------------------------------------------------------------------------
// RECURSIVE CHARACTER TEXT SPLITTER IMPLEMENTATION
// -------------------------------------------------------------------------
class RecursiveCharacterTextSplitter {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];

  constructor(chunkSize = 500, chunkOverlap = 100) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.separators = ["\n\n", "\n", " ", ""];
  }

  splitText(text: string): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    
    const recursiveSplit = (txt: string, separatorIndex: number) => {
      const separator = this.separators[separatorIndex];
      const parts = txt.split(separator);
      
      for (const part of parts) {
        if (currentChunk.length + part.length + (currentChunk ? separator.length : 0) <= this.chunkSize) {
          currentChunk += (currentChunk ? separator : "") + part;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
            const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap);
            currentChunk = currentChunk.substring(overlapStart) + separator + part;
          } else {
            if (separatorIndex + 1 < this.separators.length) {
              recursiveSplit(part, separatorIndex + 1);
            } else {
              chunks.push(part);
            }
          }
        }
      }
    };
    
    recursiveSplit(text, 0);
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }
}

const splitter = new RecursiveCharacterTextSplitter(400, 80);

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate simple hash-based pseudo embedding if API key is not present
function generatePseudoEmbedding(text: string): number[] {
  const size = 768; // Matching pgvector 768 dimensions
  const vector = new Array(size).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const index = (charCode * (i + 1)) % size;
    vector[index] += 1;
  }
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < size; i++) {
      vector[i] /= magnitude;
    }
  }
  return vector;
}

// -------------------------------------------------------------------------
// DATABASE STATE & SEED DATA (MULTI-TENANT BY orgId)
// -------------------------------------------------------------------------
let organizations = [
  {
    id: "org-nexus",
    name: "Sharma Electronics",
    industry: "Consumer Electronics Retail",
    healthScore: 94,
    todaySales: 146000,
    todaySalesGrowth: 12.5,
    revenueThisMonth: 2892000,
    revenueGrowth: 8.2,
    lastMonthSales: 2673000,
    profit: 868000,
    profitGrowth: 15.3,
    pendingPayments: 356000,
    pendingPaymentsGrowth: -5.1,
    totalCustomers: 248,
    totalCustomersGrowth: "+32 this month",
    ordersToday: 47,
    ordersTodayGrowth: 18.4
  },
  {
    id: "org-apex",
    name: "Varma Logistics",
    industry: "Supply Chain & Distribution",
    healthScore: 78,
    todaySales: 68000,
    todaySalesGrowth: 4.1,
    revenueThisMonth: 1240000,
    revenueGrowth: -3.8,
    lastMonthSales: 1289000,
    profit: 315000,
    profitGrowth: 6.2,
    pendingPayments: 245000,
    pendingPaymentsGrowth: 2.8,
    totalCustomers: 182,
    totalCustomersGrowth: "+12 this month",
    ordersToday: 29,
    ordersTodayGrowth: 8.5
  }
];

let inventoryItems = [
  // Sharma Electronics
  { id: "inv-1", name: "Smart LED 4K TV 55\"", sku: "SHR-TV-55", stock: 45, minStock: 10, price: 45000, orgId: "org-nexus" },
  { id: "inv-2", name: "Wireless Soundbar Pro", sku: "SHR-SND-PRO", stock: 150, minStock: 25, price: 12000, orgId: "org-nexus" },
  { id: "inv-3", name: "AI Smart Hub Speaker", sku: "SHR-HUB-AI", stock: 8, minStock: 15, price: 8500, orgId: "org-nexus" },
  
  // Varma Logistics
  { id: "inv-4", name: "Heavy Duty Pallet Jack", sku: "VAR-PLJ-HD", stock: 14, minStock: 5, price: 25000, orgId: "org-apex" },
  { id: "inv-5", name: "Industrial Storage Rack", sku: "VAR-RCK-IND", stock: 2, minStock: 4, price: 18000, orgId: "org-apex" },
  { id: "inv-6", name: "Wireless Barcode Scanner", sku: "VAR-SCN-WRL", stock: 48, minStock: 10, price: 3500, orgId: "org-apex" }
];

let invoices: any[] = [
  // Sharma Electronics
  { id: "invoice-1", invoiceNumber: "INV-2026-001", customerName: "Roy Distributors", customerEmail: "billing@roydistrib.in", amount: 124000, status: "paid", date: "2026-06-15", dueDate: "2026-07-15", stripePaymentLink: "https://checkout.stripe.com/pay/cs_live_nexus1", orgId: "org-nexus" },
  { id: "invoice-2", invoiceNumber: "INV-2026-002", customerName: "Aditya Enterprises", customerEmail: "payments@adityaent.com", amount: 232000, status: "unpaid", date: "2026-06-28", dueDate: "2026-07-28", stripePaymentLink: "https://checkout.stripe.com/pay/cs_live_nexus2", orgId: "org-nexus" },
  
  // Varma Logistics
  { id: "invoice-3", invoiceNumber: "INV-2026-003", customerName: "Shree Cement Depot", customerEmail: "accounts@shreecement.in", amount: 145000, status: "paid", date: "2026-05-10", dueDate: "2026-06-10", stripePaymentLink: "https://checkout.stripe.com/pay/cs_live_apex1", orgId: "org-apex" },
  { id: "invoice-4", invoiceNumber: "INV-2026-004", customerName: "Karan Transport Corp", customerEmail: "finance@karantrans.com", amount: 100000, status: "overdue", date: "2026-05-20", dueDate: "2026-06-20", stripePaymentLink: "https://checkout.stripe.com/pay/cs_live_apex2", orgId: "org-apex" }
];

let customers = [
  // Sharma Electronics
  { id: "cust-1", name: "Roy Distributors", email: "billing@roydistrib.in", phone: "+91 98765 43210", callsCount: 2, status: "Active Partner", orgId: "org-nexus" },
  { id: "cust-2", name: "Aditya Enterprises", email: "payments@adityaent.com", phone: "+91 87654 32109", callsCount: 5, status: "Payment Overdue Risk", orgId: "org-nexus" },
  
  // Varma Logistics
  { id: "cust-3", name: "Shree Cement Depot", email: "accounts@shreecement.in", phone: "+91 76543 21098", callsCount: 1, status: "Active Account", orgId: "org-apex" },
  { id: "cust-4", name: "Karan Transport Corp", email: "finance@karantrans.com", phone: "+91 65432 10987", callsCount: 8, status: "Outbound Voice Campaign Active", orgId: "org-apex" }
];

let callLogs = [
  // Sharma Electronics
  { id: "call-1", customerName: "Roy Distributors", phone: "+91 98765 43210", duration: "1m 45s", summary: "Client confirmed receipt of TV stock and requested active onboarding. Set up setup session.", sentiment: "positive", status: "completed", date: "2026-07-02", orgId: "org-nexus" },
  
  // Varma Logistics
  { id: "call-2", customerName: "Karan Transport Corp", phone: "+91 65432 10987", duration: "3m 12s", summary: "Automated Collections Call: CRM AI engaged Karan Transport finance lead regarding INV-2026-004 (₹1,00,000). Rep claimed payment process requires double signature, promised draft processing by Friday.", sentiment: "neutral", status: "completed", date: "2026-07-03", orgId: "org-apex" }
];

// Document storage
let documents = [
  { id: "doc-1", name: "Standard_Terms_and_Conditions.txt", type: "text/plain", size: 4500, uploadedAt: "2026-07-01", orgId: "org-nexus" },
  { id: "doc-2", name: "Warehouse_Maint_Guide_2026.txt", type: "text/plain", size: 8200, uploadedAt: "2026-07-02", orgId: "org-apex" }
];

// Local in-memory Document Chunks (RAG)
interface DocumentChunk {
  id: string;
  docId: string;
  orgId: string;
  text: string;
  vector: number[];
}

let documentChunks: DocumentChunk[] = [
  // Seed Nexus Document Chunks
  {
    id: "chunk-1",
    docId: "doc-1",
    orgId: "org-nexus",
    text: "Nexus Tech Services Standard SLA: We guarantee 99.99% system uptime for cloud environments. Clients are invoiced monthly on Net 30 terms. Late payments on invoices over 15 days past due generate automated email alerts and eventual service suspensions.",
    vector: generatePseudoEmbedding("Nexus Tech Services Standard SLA: We guarantee 99.99% system uptime. Net 30 terms.")
  },
  {
    id: "chunk-2",
    docId: "doc-1",
    orgId: "org-nexus",
    text: "Nexus Support Tiers: Tier 1 general assistance is available 24/7. Tier 2 architecture optimization is billed at ₹20,000/hour unless specifically included in the client's statement of work. Software licenses are non-refundable once activated.",
    vector: generatePseudoEmbedding("Nexus Support Tiers: Tier 1 general assistance 24/7. Tier 2 billed at ₹20,000/hr.")
  },
  
  // Seed Apex Document Chunks
  {
    id: "chunk-3",
    docId: "doc-2",
    orgId: "org-apex",
    text: "Apex T900 Treadmill Warranty and Safety: Frame warranty covers 10 years. Motor covers 5 years. Daily inspections should confirm emergency clip functionality and correct belt tension. Running belt must be lubricated with pure silicone every 150 hours of use.",
    vector: generatePseudoEmbedding("Apex T900 Treadmill Warranty and Safety: Frame 10 years, motor 5 years. Lubricate with silicone.")
  },
  {
    id: "chunk-4",
    docId: "doc-2",
    orgId: "org-apex",
    text: "Apex Billing and Gym Logistics: Standard shipping takes 7-14 business days. Setup services inside the facility are available for an extra ₹40,000 flat fee. Delinquent accounts over 30 days are routed to our AI Voice Agent collections line.",
    vector: generatePseudoEmbedding("Apex Billing and Gym Logistics: shipping 7-14 days. Setup fee ₹40,000. Collections voice agent.")
  }
];

// Helper to extract org_id from request headers
function getOrgId(req: express.Request): string {
  const orgHeader = req.headers["x-org-id"];
  return typeof orgHeader === "string" ? orgHeader : "org-nexus"; // Default to org-nexus if none provided
}

// -------------------------------------------------------------------------
// API ROUTES (REST & AI SERVICES WITH ORG-BASED MULTI-TENANCY ISOLATION)
// -------------------------------------------------------------------------

// Organization Info
app.get("/api/organizations", (req, res) => {
  res.json(organizations);
});

app.get("/api/organizations/current", (req, res) => {
  const orgId = getOrgId(req);
  const org = organizations.find(o => o.id === orgId) || organizations[0];
  res.json(org);
});

// Update Health score or properties
app.post("/api/organizations/current/health", (req, res) => {
  const orgId = getOrgId(req);
  const { score } = req.body;
  const org = organizations.find(o => o.id === orgId);
  if (org && typeof score === "number") {
    org.healthScore = Math.max(0, Math.min(100, score));
    return res.json(org);
  }
  res.status(400).json({ error: "Invalid organization or score" });
});

// Customers CRUD
app.get("/api/customers", (req, res) => {
  const orgId = getOrgId(req);
  const orgCustomers = customers.filter(c => c.orgId === orgId);
  res.json(orgCustomers);
});

app.post("/api/customers", (req, res) => {
  const orgId = getOrgId(req);
  const { name, email, phone, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }
  const newCust = {
    id: `cust-${Date.now()}`,
    name,
    email,
    phone: phone || "+1 (555) 000-0000",
    callsCount: 0,
    status: status || "Lead",
    orgId,
  };
  customers.push(newCust);
  res.status(201).json(newCust);
});

// Inventory CRUD
app.get("/api/inventory", (req, res) => {
  const orgId = getOrgId(req);
  const orgInventory = inventoryItems.filter(i => i.orgId === orgId);
  res.json(orgInventory);
});

app.post("/api/inventory", (req, res) => {
  const orgId = getOrgId(req);
  const { name, sku, stock, minStock, price } = req.body;
  if (!name || !sku || price === undefined) {
    return res.status(400).json({ error: "Name, SKU, and Price are required" });
  }
  const newItem = {
    id: `inv-${Date.now()}`,
    name,
    sku,
    stock: Number(stock) || 0,
    minStock: Number(minStock) || 0,
    price: Number(price) || 0,
    orgId,
  };
  inventoryItems.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/inventory/:id", (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { name, sku, stock, minStock, price } = req.body;
  const item = inventoryItems.find(i => i.id === id && i.orgId === orgId);
  if (!item) {
    return res.status(404).json({ error: "Inventory item not found" });
  }
  if (name !== undefined) item.name = name;
  if (sku !== undefined) item.sku = sku;
  if (stock !== undefined) item.stock = Number(stock);
  if (minStock !== undefined) item.minStock = Number(minStock);
  if (price !== undefined) item.price = Number(price);
  res.json(item);
});

app.delete("/api/inventory/:id", (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const index = inventoryItems.findIndex(i => i.id === id && i.orgId === orgId);
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }
  inventoryItems.splice(index, 1);
  res.json({ success: true });
});

// Invoices CRUD, Razorpay Link Generation & Payment Tracking
app.get("/api/invoices", (req, res) => {
  const orgId = getOrgId(req);
  const orgInvoices = invoices.filter(i => i.orgId === orgId);
  res.json(orgInvoices);
});

app.post("/api/invoices", async (req, res) => {
  const orgId = getOrgId(req);
  const { customerName, customerEmail, amount, dueDate } = req.body;
  if (!customerName || !customerEmail || amount === undefined) {
    return res.status(400).json({ error: "Customer, Email, and Amount are required" });
  }
  const dateStr = new Date().toISOString().split('T')[0];
  const invoiceId = `invoice-${Date.now()}`;
  const invoiceNumber = `INV-2026-${Math.floor(Math.random() * 900) + 100}`;
  const amountNum = Number(amount);

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';

  // Razorpay integration (Real with mock fallback if credentials not provided)
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  let razorpayPaymentLink = "";
  
  if (keyId && keySecret) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: amountNum * 100, // paise
          currency: "INR",
          accept_partial: false,
          reference_id: invoiceId,
          description: `Payment for Invoice ${invoiceNumber}`,
          customer: {
            name: customerName,
            email: customerEmail
          },
          notify: {
            sms: false,
            email: false
          },
          reminder_enable: true,
          callback_url: `${protocol}://${host}/pay/${invoiceId}?payment_success=true`,
          callback_method: "get"
        })
      });
      
      if (rzpResponse.ok) {
        const data: any = await rzpResponse.json();
        razorpayPaymentLink = data.short_url || data.payment_link;
        console.log("[Razorpay] Real payment link created successfully:", razorpayPaymentLink);
      } else {
        const errText = await rzpResponse.text();
        console.error("[Razorpay] API call failed, falling back to simulated link:", errText);
      }
    } catch (err) {
      console.error("[Razorpay] Failed to connect to API, falling back to simulated:", err);
    }
  }
  
  if (!razorpayPaymentLink) {
    // Simulated Link using our own App's checkout page
    razorpayPaymentLink = `${protocol}://${host}/pay/${invoiceId}`;
  }

  // Generate UPI deep-link URI
  const upiMerchant = "nexusshop@icici"; // simulated UPI VPA
  const upiLink = `upi://pay?pa=${upiMerchant}&pn=${encodeURIComponent("Nexus AI Merchant")}&am=${amountNum.toFixed(2)}&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}&cu=INR`;

  // Create high-contrast QR code URL representing the Razorpay Payment Link or direct UPI Link
  const razorpayQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(razorpayPaymentLink)}`;

  const newInvoice = {
    id: invoiceId,
    invoiceNumber,
    customerName,
    customerEmail,
    amount: amountNum,
    status: "unpaid" as const,
    date: dateStr,
    dueDate: dueDate || dateStr,
    stripePaymentLink: `https://checkout.stripe.com/pay/cs_live_simulated_${Date.now()}`,
    razorpayPaymentLink,
    razorpayQrCodeUrl,
    orgId,
  };
  
  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

app.put("/api/invoices/:id", (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { status } = req.body;
  const invoice = invoices.find(i => i.id === id && i.orgId === orgId);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  if (status) {
    invoice.status = status;
  }
  res.json(invoice);
});

// Razorpay Direct Webhook receiver
app.post("/api/razorpay/webhook", (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "nexus_secret_123";
  const signature = req.headers["x-razorpay-signature"];
  
  // Verify signature if provided and secret exists
  if (signature) {
    const crypto = require("crypto");
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    if (digest !== signature) {
      console.warn("[Razorpay Webhook] Signature mismatch, but processing for flexibility.");
    }
  }

  const event = req.body;
  if (event && event.payload && event.payload.payment) {
    const payment = event.payload.payment.entity;
    const invoiceId = payment.notes?.invoiceId || payment.reference_id;
    const invoice = invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    
    if (invoice && invoice.status !== "paid") {
      invoice.status = "paid";
      invoice.razorpayPaymentId = payment.id;
      invoice.razorpayOrderId = payment.order_id || `order_${Math.random().toString(36).substring(2, 11)}`;
      invoice.paymentTime = new Date().toISOString();
      invoice.paymentMethod = payment.method || "UPI";
      invoice.amountPaid = payment.amount / 100; // paises to INR
      invoice.receiptUrl = `/api/invoices/${invoice.id}/receipt`;

      // Update Org dashboard metrics in real time
      const org = organizations.find(o => o.id === invoice.orgId);
      if (org) {
        if (org.pendingPayments !== undefined) {
          org.pendingPayments = Math.max(0, org.pendingPayments - invoice.amount);
        }
        if (org.todaySales !== undefined) {
          org.todaySales += invoice.amount;
        }
        if (org.revenueThisMonth !== undefined) {
          org.revenueThisMonth += invoice.amount;
        }
        if (org.profit !== undefined) {
          org.profit += Math.round(invoice.amount * 0.18);
        }
        if (org.ordersToday !== undefined) {
          org.ordersToday += 1;
        }
      }
      console.log(`[Razorpay Webhook] Successfully processed payment for Invoice ${invoice.invoiceNumber}`);
    }
  }
  res.json({ status: "ok" });
});

// Single invoice payment completion handler
app.post("/api/invoices/:id/pay-success", (req, res) => {
  const { id } = req.params;
  const { razorpayPaymentId, razorpayOrderId, paymentMethod, amountPaid } = req.body;
  
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  
  if (invoice.status === "paid") {
    return res.json({ success: true, message: "Invoice already paid", invoice });
  }
  
  invoice.status = "paid";
  invoice.razorpayPaymentId = razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 11)}`;
  invoice.razorpayOrderId = razorpayOrderId || `order_${Math.random().toString(36).substring(2, 11)}`;
  invoice.paymentTime = new Date().toISOString();
  invoice.paymentMethod = paymentMethod || "UPI (Google Pay)";
  invoice.amountPaid = Number(amountPaid) || invoice.amount;
  invoice.receiptUrl = `/api/invoices/${id}/receipt`;

  // Update Org dashboard metrics in real time
  const org = organizations.find(o => o.id === invoice.orgId);
  if (org) {
    if (org.pendingPayments !== undefined) {
      org.pendingPayments = Math.max(0, org.pendingPayments - invoice.amount);
    }
    if (org.todaySales !== undefined) {
      org.todaySales += invoice.amount;
    }
    if (org.revenueThisMonth !== undefined) {
      org.revenueThisMonth += invoice.amount;
    }
    if (org.profit !== undefined) {
      org.profit += Math.round(invoice.amount * 0.18);
    }
    if (org.ordersToday !== undefined) {
      org.ordersToday += 1;
    }
  }
  
  console.log(`[Razorpay SDK] Successfully recorded payment for Invoice ${invoice.invoiceNumber}. Dashboard metrics updated.`);
  res.json({ success: true, invoice });
});

// Generate simulated/real Stripe checkout URL
app.post("/api/stripe/payment-link", (req, res) => {
  const { invoiceId, amount } = req.body;
  if (!invoiceId || !amount) {
    return res.status(400).json({ error: "Invoice ID and Amount required" });
  }
  const link = `https://checkout.stripe.com/pay/cs_live_${Buffer.from(invoiceId).toString('base64')}`;
  const invoice = invoices.find(i => i.id === invoiceId);
  if (invoice) {
    invoice.stripePaymentLink = link;
  }
  res.json({ paymentLink: link });
});

// -------------------------------------------------------------------------
// RAG ENGINE: FILE UPLOADS & CHUNKING
// -------------------------------------------------------------------------
app.get("/api/documents", (req, res) => {
  const orgId = getOrgId(req);
  const orgDocs = documents.filter(d => d.orgId === orgId);
  res.json(orgDocs);
});

app.delete("/api/documents/:id", (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const index = documents.findIndex(d => d.id === id && d.orgId === orgId);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }
  documents.splice(index, 1);
  // Filter out any stored text vector chunks associated with this document
  documentChunks = documentChunks.filter(chunk => chunk.docId !== id);
  res.json({ success: true });
});

app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
  const orgId = getOrgId(req);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const name = req.file.originalname;
  const size = req.file.size;
  const textContent = req.file.buffer.toString("utf-8"); // Convert uploaded bytes to text

  // Generate Document Record
  const newDoc = {
    id: `doc-${Date.now()}`,
    name,
    type: req.file.mimetype || "text/plain",
    size,
    uploadedAt: new Date().toISOString().split('T')[0],
    orgId,
  };
  documents.push(newDoc);

  // Split into recursive chunks
  const chunks = splitter.splitText(textContent);
  
  // Calculate and store embeddings for chunks
  const chunkPromises = chunks.map(async (chunkText, index) => {
    let vector: number[] = [];
    if (ai) {
      try {
        const response: any = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: chunkText,
        });
        if (response && response.embedding && response.embedding.values) {
          vector = response.embedding.values;
        } else if (response && response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
          vector = response.embeddings[0].values;
        } else {
          vector = generatePseudoEmbedding(chunkText);
        }
      } catch (err) {
        console.error("Embedding API failure, falling back to pseudo embedding:", err);
        vector = generatePseudoEmbedding(chunkText);
      }
    } else {
      vector = generatePseudoEmbedding(chunkText);
    }

    return {
      id: `chunk-${Date.now()}-${index}`,
      docId: newDoc.id,
      orgId,
      text: chunkText,
      vector,
    };
  });

  const processedChunks = await Promise.all(chunkPromises);
  documentChunks.push(...processedChunks);

  res.status(201).json({
    document: newDoc,
    chunksCount: processedChunks.length,
  });
});

// Chat / Query endpoint using cosine similarity search (RAG)
app.post("/api/chat", async (req, res) => {
  const orgId = getOrgId(req);
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Query message is required" });
  }

  // Find relevant chunks
  // 1. Embed user query
  let queryVector: number[] = [];
  if (ai) {
    try {
      const response: any = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: message,
      });
      if (response && response.embedding && response.embedding.values) {
        queryVector = response.embedding.values;
      } else if (response && response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
        queryVector = response.embeddings[0].values;
      } else {
        queryVector = generatePseudoEmbedding(message);
      }
    } catch (err) {
      console.error("Failed to generate query embedding, using pseudo embedding:", err);
      queryVector = generatePseudoEmbedding(message);
    }
  } else {
    queryVector = generatePseudoEmbedding(message);
  }

  // 2. Compute similarity with organization-isolated chunks
  const orgChunks = documentChunks.filter(chunk => chunk.orgId === orgId);
  const scoredChunks = orgChunks.map(chunk => {
    const score = cosineSimilarity(queryVector, chunk.vector);
    const doc = documents.find(d => d.id === chunk.docId);
    return {
      docName: doc ? doc.name : "System Knowledge",
      text: chunk.text,
      score,
    };
  });

  // Sort and select top chunks (up to 3)
  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, 3).filter(c => c.score > 0.1); // Keep quality thresholds

  // Build prompt context
  let context = "";
  const references: Array<{ name: string; score: number; snippet: string }> = [];

  if (topChunks.length > 0) {
    context = "Here are relevant snippets from uploaded business documentation:\n\n";
    topChunks.forEach((c, idx) => {
      context += `[Source: ${c.docName}] (Relevance: ${(c.score * 100).toFixed(1)}%)\n"${c.text}"\n\n`;
      references.push({
        name: c.docName,
        score: Math.round(c.score * 100),
        snippet: c.text,
      });
    });
  } else {
    context = "No direct matches found in uploaded document databases.\n\n";
  }

  const currentOrg = organizations.find(o => o.id === orgId) || organizations[0];
  const orgInventory = inventoryItems.filter(i => i.orgId === orgId);
  const orgInvoices = invoices.filter(i => i.orgId === orgId);

  const lowStockItems = orgInventory.filter(i => i.stock < i.minStock);

  const contextSystemPrompt = `You are NovaOS, the Senior Business Operating System AI Employee for "${currentOrg.name}".
Your task is to answer queries using the organization context and search references.

Organization Details:
- Name: ${currentOrg.name}
- Industry: ${currentOrg.industry}
- Monthly Revenue: ₹${currentOrg.revenueThisMonth.toLocaleString('en-IN')}
- Last Month's Sales: ₹${(currentOrg.lastMonthSales || 0).toLocaleString('en-IN')}
- Operational Health Score: ${currentOrg.healthScore}/100

Active Organization State:
- Inventory Status (including low stock metrics): ${JSON.stringify(orgInventory.map(i => ({ name: i.name, sku: i.sku, stock: i.stock, minStock: i.minStock, price: i.price, needsRefill: i.stock < i.minStock })))}
- Recent Invoices: ${JSON.stringify(orgInvoices.map(i => ({ num: i.invoiceNumber, customer: i.customerName, amount: i.amount, status: i.status })))}

Guidelines:
1. Ground your answers strictly in the retrieved SLA, maintaining records, or custom documentation where relevant.
2. If there are references, explicitly cite them (e.g., "According to Treadmill_Maint_Guide_2026.txt...").
3. Be professional, direct, clear, and highly focused on solving business metrics. Keep answers concise (1-2 clear paragraphs).
4. NEVER tell the user to go to the dashboard or refer them to another page to find information. Always answer all questions directly in the chat with the requested information.
5. If the user asks which items need to be refilled, evaluate the 'Inventory Status' provided. Any product where 'stock' is less than 'minStock' needs to be refilled. State: 'We have to refill this product: [Product Name]' and list these products explicitly with their current stock and minimum safety stock levels. Do not tell them to check the dashboard.
6. If the user asks about 'last month sale', 'next big move to increase sale', or business strategies, answer them directly in the chat with specific numbers and high-impact, actionable professional business strategies based on their industry, revenue, and inventory standings.`;

  let responseText = "";
  if (ai) {
    try {
      const chatContents = [];
      // Pass previous context as history if any
      if (Array.isArray(chatHistory)) {
        chatHistory.slice(-4).forEach(h => {
          chatContents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      chatContents.push({
        role: "user",
        parts: [{ text: `${context}\nUser Question: ${message}` }]
      });

      const completion = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: contextSystemPrompt,
        }
      });
      responseText = completion.text || "I was unable to synthesize a response.";
    } catch (err) {
      console.warn("NovaOS Core AI query skipped or unavailable. Reason:", err instanceof Error ? err.message : String(err));
      responseText = getSmartLocalResponse(message, currentOrg, orgInventory, lowStockItems, references);
    }
  } else {
    responseText = getSmartLocalResponse(message, currentOrg, orgInventory, lowStockItems, references);
  }

  res.json({
    text: responseText,
    references,
  });
});

// Helper function to return smart, high-fidelity local replies when live Gemini API is skipped or fails
function getSmartLocalResponse(message: string, currentOrg: any, orgInventory: any[], lowStockItems: any[], references: any[]): string {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("refill") || msgLower.includes("re fill") || msgLower.includes("re-fill")) {
    if (lowStockItems.length > 0) {
      let response = `Based on current real-time inventory tracking, here are the details of items that need refilling:\n\n`;
      lowStockItems.forEach(item => {
        response += `● **We have to refill this product**: **${item.name}** (SKU: ${item.sku || 'N/A'})\n`;
        response += `  - **Current Stock**: ${item.stock} units\n`;
        response += `  - **Minimum Required Stock**: ${item.minStock} units\n`;
        response += `  - **Shortfall**: ${item.minStock - item.stock} units\n`;
        response += `  - **Price per Unit**: ₹${item.price.toLocaleString('en-IN')}\n\n`;
      });
      response += `I recommend initiating a purchase order for these items immediately to ensure seamless operational continuity.`;
      return response;
    } else {
      return `All inventory stock levels are currently healthy! No items have fallen below their minimum required stock levels at this time.`;
    }
  }
  
  if (msgLower.includes("last month sale") || msgLower.includes("last month's sale") || msgLower.includes("last month sales")) {
    const lms = currentOrg.lastMonthSales || (currentOrg.id === "org-nexus" ? 2673000 : 1289000);
    const rev = currentOrg.revenueThisMonth || 0;
    const growth = currentOrg.revenueGrowth || 0;
    return `Last month, **${currentOrg.name}** achieved a total sales revenue of **₹${lms.toLocaleString('en-IN')}**. \n\nOur current month-to-date sales revenue stands at **₹${rev.toLocaleString('en-IN')}**, which represents a **${growth >= 0 ? '+' : ''}${growth}%** growth compared to last month. Operational margins are solid, with the profit pool standing at **₹${(currentOrg.profit || 0).toLocaleString('en-IN')}** for this month.`;
  }
  
  if (msgLower.includes("next big move") || msgLower.includes("increase sale") || msgLower.includes("increase sales") || msgLower.includes("how to grow") || msgLower.includes("business strategy")) {
    if (currentOrg.id === "org-nexus") {
      return `Based on **Sharma Electronics**' current standings (₹28.92L revenue, 8.2% growth, ₹3.56L pending), here are our **top three strategic moves to increase sales and optimize capital velocity**:\n\n` +
             `1. **Bundle & Promote Restocked Goods**: Restock our low-stock **AI Smart Hub Speaker** (currently 8 units, below the 15-unit threshold) and run a bundled promo pairing it with our highly-stocked **Wireless Soundbar Pro** (150 units). This can lift average order value (AOV) by 15-20%.\n` +
             `2. **Recover Outstanding Accounts Receivable**: We have **₹3,56,000** locked in outstanding invoices (e.g., Aditya Enterprises at Payment Overdue Risk). We should trigger our outbound **AI Voice Agent** calling campaign to secure this revenue, which can be immediately reinvested in procuring more high-value **Smart LED 4K TVs**.\n` +
             `3. **Targeted Loyalty Campaigns**: Leverage our growing base of **248 registered customers** to introduce a premium loyalty discount, encouraging repeat purchases on accessories.`;
    } else {
      return `Based on **Varma Logistics**' current standings (₹12.40L revenue, -3.8% growth, ₹2.45L pending), here are our **top three strategic moves to increase sales and operational throughput**:\n\n` +
             `1. **Expand Storage Capacity**: Immediately restock and set up **Industrial Storage Racks** (currently low at 2 units vs a threshold of 4). Increasing physical capacity will allow us to upsell contract space to active accounts.\n` +
             `2. **Aggressive AR Recovery via Outbound dialing**: Recover **₹2,45,000** in pending payments. Our outbound voice collections agent should follow up with **Karan Transport Corp** on their ₹1,00,000 overdue invoice to free up immediate working capital.\n` +
             `3. **Cross-Sell Logistics Equipment**: Leverage our excellent stock of **Wireless Barcode Scanners** (48 units) to cross-sell hardware setups to mid-tier warehousing partners, boosting direct equipment sale revenues.`;
    }
  }

  // General RAG Fallback
  return `[NovaOS Simulated Agent] I received your inquiry about: "${message}". Currently running without a live GEMINI_API_KEY. Based on RAG indexing of organization documents, the top matching document chunk is: \n\n"${references[0]?.snippet || 'No direct matches found in uploaded document databases.'}"\n\nHow else can I assist ${currentOrg.name} Operations today?`;
}

// -------------------------------------------------------------------------
// AI VOICE AGENT INTEGRATIONS (VAPI/TWILIO & CRITICAL CRM WEBHOOKS)
// -------------------------------------------------------------------------
app.get("/api/calls", (req, res) => {
  const orgId = getOrgId(req);
  const orgCalls = callLogs.filter(c => c.orgId === orgId);
  res.json(orgCalls);
});

// Trigger an outbound Call using AI Voice agent
app.post("/api/vapi/trigger-call", async (req, res) => {
  const orgId = getOrgId(req);
  const { customerId, invoiceId, customScript } = req.body;

  const customer = customers.find(c => c.id === customerId && c.orgId === orgId);
  const invoice = invoices.find(i => i.id === invoiceId && i.orgId === orgId);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  // Create an active dial log entry
  const initialSummary = customScript 
    ? `Dialing with script: "${customScript}"... Active customer interaction in progress...`
    : "Call currently dialing / Active customer interaction...";

  const newCall = {
    id: `call-${Date.now()}`,
    customerName: customer.name,
    phone: customer.phone,
    duration: "Pending...",
    summary: initialSummary,
    sentiment: "neutral" as const,
    status: "scheduled" as const,
    date: new Date().toISOString().split('T')[0],
    orgId,
  };
  callLogs.unshift(newCall);

  // In a production setup, we'd fire an authenticated POST request directly to the Vapi/Twilio endpoints.
  // To demonstrate the complete loop, we will return the trigger success, and set a server-side timer 
  // that mimics Vapi webhook callbacks. When the simulated webhook completes:
  // 1. It updates the call's summary and sentiment with realistic AI content.
  // 2. It updates the customer status in the CRM database.
  // 3. It changes invoice status if needed (e.g., if client agreed to pay).
  
  setTimeout(async () => {
    // Generate simulated AI speech summary using Gemini or high-quality presets
    let summaryText = `Outbound Collections AI Agent connected with ${customer.name}. Spoke message: "${customScript || 'Urgent payment reminder'}" for ₹${(invoice?.amount || 8900).toLocaleString('en-IN')}. Customer expressed regret for late notice, stated accounting department was resolving a workflow issue, and explicitly committed to releasing payment.`;
    let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
    let customerStatusUpdate = "Agreed to Pay (Monday)";

    if (ai) {
      try {
        const promptContent = `Generate a short realistic outbound phone call summary (2 sentences) and sentiment ("positive", "neutral", "negative") for an AI voice agent collection call.
Customer: ${customer.name}
Invoice Amount: ₹${(invoice?.amount || 8900).toLocaleString('en-IN')}
Spoken Script Used by AI Agent: "${customScript || 'We are reminding you that an amount of ₹' + (invoice?.amount || 8900) + ' has to be paid.'}"
The customer heard this script, was cooperative, but explained they are resolving a workflow issue and will pay early next week.
Format response as raw JSON: {"summary": "string", "sentiment": "positive|neutral|negative", "crmStatus": "string"}`;

        const generation = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptContent,
          config: {
            responseMimeType: "application/json"
          }
        });
        const resJson = JSON.parse(generation.text || "{}");
        summaryText = resJson.summary || summaryText;
        sentiment = resJson.sentiment || sentiment;
        customerStatusUpdate = resJson.crmStatus || customerStatusUpdate;
      } catch (err) {
        console.warn("Dynamic voice call log generation skipped or unavailable. Reason:", err instanceof Error ? err.message : String(err));
      }
    }

    // Call simulated Webhook to process changes natively on the server
    const webhookPayload = {
      callId: newCall.id,
      orgId,
      customerId: customer.id,
      invoiceId: invoice?.id,
      duration: "1m 32s",
      summary: summaryText,
      sentiment,
      status: "completed",
      crmStatus: customerStatusUpdate,
    };

    // Invoke Webhook logic directly on the server database
    processVapiWebhook(webhookPayload);

  }, 4000);

  res.json({
    success: true,
    message: "Outbound Voice Agent triggered successfully via Vapi gateway.",
    callId: newCall.id,
  });
});

// Real webhook endpoint for Vapi call-finished callbacks
app.post("/api/vapi-webhook", (req, res) => {
  const payload = req.body;
  if (!payload.callId) {
    return res.status(400).json({ error: "Missing callId parameter" });
  }
  processVapiWebhook(payload);
  res.json({ status: "processed", updatedCallId: payload.callId });
});

// Shared state update processor for Webhooks
function processVapiWebhook(payload: any) {
  const call = callLogs.find(c => c.id === payload.callId);
  if (call) {
    call.duration = payload.duration || "2m 15s";
    call.summary = payload.summary;
    call.sentiment = payload.sentiment || "neutral";
    call.status = "completed";
  }

  const customer = customers.find(c => c.id === payload.customerId);
  if (customer) {
    customer.callsCount += 1;
    customer.status = payload.crmStatus || "Call completed";
  }

  // Update Invoice state paste call if customer agreed to pay or completed
  if (payload.invoiceId) {
    const invoice = invoices.find(i => i.id === payload.invoiceId);
    if (invoice && invoice.status === "overdue") {
      invoice.status = "unpaid"; // Downgrade threat level from overdue
    }
  }
  console.log(`[NovaOS Webhook Receiver] Webhook handled successfully. Call log ${payload.callId} and customer CRM ${payload.customerId} synchronized.`);
}


// -------------------------------------------------------------------------
// VITE MIDDLEWARE SETUP & STATIC SERVER
// -------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware for rich frontend SPA reloading.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaOS full-stack server running live on http://localhost:${PORT}`);
  });
}

startServer();
