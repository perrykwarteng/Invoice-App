import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { FRONTEND_LOCAL_URL, FRONTEND_URL, PORT } from "./config/envs.js";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import userRoutes from "./routes/user.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import statsRoutes from "./routes/dashboardStat.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();
const allowedOrigins = [FRONTEND_LOCAL_URL, FRONTEND_URL];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.sendStatus(200);
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/statistics", statsRoutes);
app.use("/api/v1/settings", settingsRoutes);

app.listen(PORT, () =>
  console.log(`App is running on http://localhost:${PORT}`),
);
