import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import africastalking from "africastalking";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory store for OTPs (In production, use Redis or a DB)
const otpStore = new Map<string, { code: string; expires: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Africa's Talking Configuration
  const atConfig = {
    apiKey: process.env.AFRICAS_TALKING_API_KEY,
    username: process.env.AFRICAS_TALKING_USERNAME,
  };

  const at = africastalking(atConfig);
  const sms = at.SMS;

  // API to Send OTP
  app.post("/api/otp/send", async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number required" });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phoneNumber, { code, expires });

    try {
      if (atConfig.apiKey) {
        await sms.send({
          to: [phoneNumber],
          message: `Your TenantBora verification code is: ${code}. Valid for 5 minutes.`,
        });
        res.json({ success: true, message: "OTP sent successfully" });
      } else {
        console.log(`[DEV MODE] OTP for ${phoneNumber}: ${code}`);
        res.json({ success: true, message: "OTP logged in dev mode", devCode: code });
      }
    } catch (error: any) {
      console.error("SMS Error:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // API to Verify OTP
  app.post("/api/otp/verify", (req, res) => {
    const { phoneNumber, code } = req.body;
    const stored = otpStore.get(phoneNumber);

    if (!stored) return res.status(400).json({ error: "No OTP found for this number" });
    if (Date.now() > stored.expires) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ error: "OTP expired" });
    }
    if (stored.code !== code) return res.status(400).json({ error: "Invalid OTP" });

    otpStore.delete(phoneNumber);
    res.json({ success: true, message: "OTP verified" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
