import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" })); // Increase payload limit for file uploads
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // CORS headers for development
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Shared state
  let activeUsers = 0;
  const contributions: any[] = [
    {
      id: 1,
      user: "Elena M.",
      location: "Amazon Basin, Brazil",
      action: "Identified rare orchid species",
      time: "12m ago",
      icon: "Leaf",
    },
    {
      id: 2,
      user: "Kofi A.",
      location: "Nairobi, Kenya",
      action: "Deployed 5 new soil sensors",
      time: "45m ago",
      icon: "Zap",
    },
    {
      id: 3,
      user: "Yuki T.",
      location: "Kyoto, Japan",
      action: "Reported early cherry blossom bloom",
      time: "2h ago",
      icon: "Sparkles",
    },
    {
      id: 4,
      user: "Sarah J.",
      location: "London, UK",
      action: "Completed urban canopy survey",
      time: "5h ago",
      icon: "Database",
    },
  ];

  const notifications: any[] = [
    {
      id: 1,
      type: "alert",
      message: "Anomalous moisture drop detected in Sector 7G",
      time: "5m ago",
      read: false,
    },
    {
      id: 2,
      type: "ai",
      message:
        "Nature AI: Predicted 15% increase in biodiversity if current trends continue.",
      time: "1h ago",
      read: true,
    },
  ];

  const speciesSightings: any[] = [
    {
      id: 1,
      species: "Snow Leopard",
      location: "Himalayas, Nepal",
      observer: "Dr. Aris",
      date: "2024-03-01",
      status: "Endangered",
      image: "https://picsum.photos/seed/leopard/400/300",
    },
    {
      id: 2,
      species: "Golden Toad",
      location: "Monteverde, Costa Rica",
      observer: "Maria G.",
      date: "2024-03-05",
      status: "Critically Endangered",
      image: "https://picsum.photos/seed/toad/400/300",
    },
  ];

  const scheduledTasks: any[] = [
    {
      id: 1,
      title: "Sensor Calibration",
      date: "2024-03-10",
      time: "09:00",
      priority: "High",
      status: "Pending",
      assignee: "Erik S.",
      location: "Sector 7G - Urban Forest",
      tools: ["Multimeter", "Calibration Kit v2"],
      duration: "2 hours",
      description:
        "Standard quarterly calibration of moisture and temperature sensors.",
    },
    {
      id: 2,
      title: "Soil Sample Collection",
      date: "2024-03-12",
      time: "14:30",
      priority: "Medium",
      status: "Pending",
      assignee: "Maria G.",
      location: "Central Park - North Meadow",
      tools: ["Soil Auger", "Sample Bags", "GPS Tracker"],
      duration: "4 hours",
      description:
        "Collecting samples for nutrient analysis and microbial diversity survey.",
    },
  ];

  const userProfiles: Record<string, any> = {};
  const apiKeys: Record<string, any[]> = {};
  const userFeedback: any[] = [];

  // Mesh Data Feed with Coordinates for Map
  let meshData: any[] = [
    {
      id: "node-1",
      name: "Sector 7G Node",
      location: "Sector 7G",
      moisture: 42,
      temp: 24.5,
      humidity: 65,
      aqi: 12,
      status: "online",
      coordinates: [-74.006, 40.7128],
    },
    {
      id: "node-2",
      name: "Central Park Hub",
      location: "Central Park",
      moisture: 38,
      temp: 22.1,
      humidity: 58,
      aqi: 15,
      status: "online",
      coordinates: [-73.9654, 40.7829],
    },
    {
      id: "node-3",
      name: "North Port Gateway",
      location: "North Port",
      moisture: 55,
      temp: 26.8,
      humidity: 72,
      aqi: 45,
      status: "warning",
      coordinates: [-74.0445, 40.6892],
    },
    {
      id: "node-4",
      name: "East River Sensor",
      location: "East River",
      moisture: 62,
      temp: 21.5,
      humidity: 80,
      aqi: 10,
      status: "online",
      coordinates: [-73.9733, 40.7394],
    },
    {
      id: "node-5",
      name: "Brooklyn Bridge Node",
      location: "Brooklyn",
      moisture: 30,
      temp: 25.2,
      humidity: 50,
      aqi: 22,
      status: "online",
      coordinates: [-73.9969, 40.7061],
    },
  ];

  // Simulation State
  let simulationState = {
    active: false,
    scenario: "none",
    progress: 0,
    results: null as any,
  };

  // AI Agent Simulation
  setInterval(() => {
    // Update mesh data randomly
    meshData = meshData.map((node) => ({
      ...node,
      moisture: Math.max(
        0,
        Math.min(100, node.moisture + (Math.random() - 0.5) * 2),
      ),
      temp: node.temp + (Math.random() - 0.5),
      humidity: Math.max(
        0,
        Math.min(100, node.humidity + (Math.random() - 0.5) * 5),
      ),
      aqi: Math.max(0, node.aqi + (Math.random() - 0.5) * 4),
    }));
    broadcast({ type: "MESH_UPDATE", payload: meshData });

    const insights = [
      {
        type: "ai",
        message:
          "Nature AI: Soil moisture levels in Central Park are optimal for fungal growth.",
        target: "dashboard",
      },
      {
        type: "ai",
        message:
          "Nature AI: Acoustic sensors detected a rare migratory bird in the northern sector.",
        target: "species",
      },
      {
        type: "ai",
        message:
          "Nature AI: Urban heat island effect is decreasing due to increased canopy coverage.",
        target: "analytics",
      },
      {
        type: "ai",
        message:
          "Nature AI: Carbon sequestration rates have peaked for the current season.",
        target: "analytics",
      },
      {
        type: "alert",
        message:
          "Industrial Alert: Anomalous air quality drop in North Port Industrial Zone.",
        target: "global",
      },
      {
        type: "alert",
        message:
          "Global Mesh: New high-density biodiversity node active in Amazon Basin.",
        target: "community",
      },
    ];
    const insight = insights[Math.floor(Math.random() * insights.length)];
    const notification = {
      id: Date.now(),
      type: insight.type,
      message: insight.message,
      target: insight.target,
      time: "Just now",
      read: false,
    };
    notifications.unshift(notification);
    if (notifications.length > 10) notifications.pop();
    broadcast({ type: "NEW_NOTIFICATION", payload: notification });
  }, 45000); // Send an AI insight every 45 seconds

  // WebSocket handling
  wss.on("connection", (ws, req) => {
    console.log(`New WS connection from ${req.socket.remoteAddress}`);
    activeUsers++;
    broadcast({ type: "PRESENCE_UPDATE", count: activeUsers });

    // Send initial state
    ws.send(JSON.stringify({ type: "INIT", contributions, notifications }));

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "NEW_CONTRIBUTION") {
          const newContribution = {
            id: Date.now(),
            ...message.payload,
            time: "Just now",
          };
          contributions.unshift(newContribution);
          if (contributions.length > 20) contributions.pop();
          broadcast({ type: "CONTRIBUTION_ADDED", payload: newContribution });

          // Also create a notification for the contribution
          const notification = {
            id: Date.now() + 1,
            type: "info",
            message: `${newContribution.user} shared a new contribution!`,
            time: "Just now",
            read: false,
          };
          notifications.unshift(notification);
          broadcast({ type: "NEW_NOTIFICATION", payload: notification });
        }
      } catch (e) {
        console.error("WS Error:", e);
      }
    });

    ws.on("close", () => {
      activeUsers--;
      broadcast({ type: "PRESENCE_UPDATE", count: activeUsers });
    });
  });

  function broadcast(data: any) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", users: activeUsers });
  });

  app.get("/api/species", (req, res) => {
    res.json(speciesSightings);
  });

  app.get("/api/tasks", (req, res) => {
    res.json(scheduledTasks);
  });

  app.post("/api/tasks", (req, res) => {
    const task = {
      id: Date.now(),
      ...req.body,
      status: "Pending",
    };
    scheduledTasks.push(task);
    res.json(task);
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const index = scheduledTasks.findIndex((t) => t.id === parseInt(id));
    if (index !== -1) {
      scheduledTasks[index] = { ...scheduledTasks[index], ...req.body };
      res.json(scheduledTasks[index]);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.post("/api/species", (req, res) => {
    const sighting = {
      id: Date.now(),
      ...req.body,
      date: new Date().toISOString().split("T")[0],
    };
    speciesSightings.unshift(sighting);
    if (speciesSightings.length > 50) speciesSightings.pop();

    // Broadcast notification
    const notification = {
      id: Date.now() + 1,
      type: "species",
      message: `New sighting: ${sighting.species} spotted in ${sighting.location}!`,
      time: "Just now",
      read: false,
    };
    notifications.unshift(notification);
    broadcast({ type: "NEW_NOTIFICATION", payload: notification });

    res.json(sighting);
  });

  app.post("/api/paypal/capture", async (req, res) => {
    const { orderID } = req.body;
    const clientID = process.env.VITE_PAYPAL_CLIENT_ID;
    const secretKey = process.env.PAYPAL_SECRET_KEY;
    const isSandbox = (process.env.VITE_PAYPAL_ENV || "sandbox") === "sandbox";
    const paypalBaseUrl = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    if (!clientID || !secretKey) {
      console.error(
        "PayPal Error: Missing credentials. Ensure VITE_PAYPAL_CLIENT_ID and PAYPAL_SECRET_KEY are set.",
      );
      return res
        .status(500)
        .json({ error: "PayPal credentials not configured on the server." });
    }

    try {
      // 1. Get Access Token
      const auth = Buffer.from(`${clientID}:${secretKey}`).toString("base64");
      const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("PayPal Auth Error:", errorData);
        return res
          .status(tokenResponse.status)
          .json({
            error: "Failed to authenticate with PayPal",
            details: errorData,
          });
      }

      const { access_token } = await tokenResponse.json();

      // 2. Capture Order
      const captureResponse = await fetch(
        `${paypalBaseUrl}/v2/checkout/orders/${orderID}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const details = await captureResponse.json();

      if (captureResponse.ok && details.status === "COMPLETED") {
        res.json({ status: "success", details });
      } else {
        console.error("PayPal Capture Failed:", details);
        res
          .status(captureResponse.status || 400)
          .json({ status: "failed", details });
      }
    } catch (error: any) {
      console.error("PayPal Capture Error:", error);
      res
        .status(500)
        .json({
          error: "Internal server error during PayPal capture",
          message: error.message,
        });
    }
  });

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const clientID = process.env.GITHUB_CLIENT_ID;
    if (!clientID)
      return res.status(500).json({ error: "GitHub Client ID not configured" });

    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&scope=repo,user`;
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !clientID || !clientSecret) {
      return res.status(400).send("Missing code or credentials");
    }

    try {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: clientID,
            client_secret: clientSecret,
            code,
          }),
        },
      );

      const data = await response.json();
      if (data.access_token) {
        res.cookie("github_token", data.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>GitHub connected successfully. This window should close automatically.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send("Failed to get access token");
      }
    } catch (error) {
      console.error("GitHub Auth Error:", error);
      res
        .status(500)
        .send("Internal server error during GitHub authentication");
    }
  });

  app.get("/api/auth/github/status", (req, res) => {
    const token = req.cookies.github_token;
    res.json({ connected: !!token });
  });

  app.get("/api/github/user", async (req, res) => {
    const token = req.cookies.github_token;
    if (!token) return res.status(401).json({ error: "Not connected" });

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${token}` },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/github/logout", (req, res) => {
    res.clearCookie("github_token");
    res.json({ success: true });
  });

  app.post("/api/github/push", async (req, res) => {
    const token = req.cookies.github_token;
    if (!token)
      return res.status(401).json({ error: "Not connected to GitHub" });

    const { repoName, fileName, content, message } = req.body;

    try {
      // 1. Get User Info
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `token ${token}` },
      });
      const user = await userRes.json();
      const username = user.login;

      // 2. Check if repo exists, if not create it
      const repoRes = await fetch(
        `https://api.github.com/repos/${username}/${repoName}`,
        {
          headers: { Authorization: `token ${token}` },
        },
      );

      if (repoRes.status === 404) {
        await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: repoName, private: false }),
        });
      }

      // 3. Get file SHA if it exists
      const fileRes = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${fileName}`,
        {
          headers: { Authorization: `token ${token}` },
        },
      );
      let sha;
      if (fileRes.status === 200) {
        const fileData = await fileRes.json();
        sha = fileData.sha;
      }

      // 4. Create or Update file
      const pushRes = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/${fileName}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message || "Update from Project Genie",
            content: Buffer.from(content).toString("base64"),
            sha,
          }),
        },
      );

      if (pushRes.ok) {
        res.json({
          success: true,
          url: `https://github.com/${username}/${repoName}`,
        });
      } else {
        const error = await pushRes.json();
        res.status(pushRes.status).json({ error });
      }
    } catch (error) {
      console.error("GitHub Push Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during GitHub push" });
    }
  });

  app.get("/api/user/profile/:uid", (req, res) => {
    const { uid } = req.params;
    res.json(
      userProfiles[uid] || {
        displayName: "New User",
        bio: "",
        location: "",
        avatar: "",
        role: "contributor",
      },
    );
  });

  app.post("/api/user/profile/:uid", (req, res) => {
    const { uid } = req.params;
    userProfiles[uid] = { ...userProfiles[uid], ...req.body };
    res.json(userProfiles[uid]);
  });

  app.get("/api/mesh-data", (req, res) => {
    res.json(meshData);
  });

  app.get("/api/predictions", (req, res) => {
    const predictions = [
      { time: "Next 24h", moisture: 40, temp: 25, biodiversity: 7.9 },
      { time: "Next 48h", moisture: 38, temp: 26, biodiversity: 8.0 },
      { time: "Next 72h", moisture: 35, temp: 27, biodiversity: 8.1 },
      { time: "Next 96h", moisture: 33, temp: 28, biodiversity: 8.2 },
    ];
    res.json(predictions);
  });

  app.get("/api/simulation/status", (req, res) => {
    res.json(simulationState);
  });

  app.get("/api/keys/:uid", (req, res) => {
    const { uid } = req.params;
    res.json(apiKeys[uid] || []);
  });

  app.post("/api/keys/:uid", (req, res) => {
    const { uid } = req.params;
    const { name } = req.body;
    const newKey = {
      id: Math.random().toString(36).substring(7),
      name,
      key: `ion_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      created: new Date().toISOString(),
      lastUsed: "Never",
    };
    if (!apiKeys[uid]) apiKeys[uid] = [];
    apiKeys[uid].push(newKey);
    res.json(newKey);
  });

  app.delete("/api/keys/:uid/:keyId", (req, res) => {
    const { uid, keyId } = req.params;
    if (apiKeys[uid]) {
      apiKeys[uid] = apiKeys[uid].filter((k) => k.id !== keyId);
    }
    res.json({ success: true });
  });

  app.post("/api/feedback", (req, res) => {
    const feedback = {
      id: Date.now(),
      ...req.body,
      timestamp: new Date().toISOString(),
    };
    userFeedback.push(feedback);
    console.log("New Feedback Received:", feedback);
    res.json({ success: true });
  });

  app.post("/api/notifications/email", (req, res) => {
    const { email, subject, body } = req.body;
    console.log(
      `[EMAIL SIMULATION] To: ${email} | Subject: ${subject} | Body: ${body}`,
    );
    res.json({
      success: true,
      message: "Email notification simulated successfully",
    });
  });

  app.post("/api/simulation/control", (req, res) => {
    const { action, scenario, parameters } = req.body;
    if (action === "start") {
      simulationState = { active: true, scenario, progress: 0, results: null };
      console.log(`Starting simulation: ${scenario} with params:`, parameters);
      // Simulate progress
      const interval = setInterval(() => {
        simulationState.progress += 10;
        broadcast({ type: "SIMULATION_UPDATE", payload: simulationState });
        if (simulationState.progress >= 100) {
          clearInterval(interval);
          simulationState.active = false;
          simulationState.results = {
            impact: `Simulation for ${scenario} complete. Parameters used: ${JSON.stringify(parameters)}.`,
            recommendation:
              "Based on the enhanced simulation, we recommend a 15% increase in canopy density and 10% reduction in peak-hour irrigation.",
          };
          broadcast({ type: "SIMULATION_COMPLETE", payload: simulationState });
        }
      }, 1000);
    } else if (action === "stop") {
      simulationState.active = false;
    }
    res.json(simulationState);
  });

  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    if (!stripe) {
      console.error(
        "Stripe Error: Missing STRIPE_SECRET_KEY environment variable.",
      );
      return res
        .status(500)
        .json({
          error:
            "Stripe is not configured on the server. Please set the STRIPE_SECRET_KEY environment variable.",
        });
    }

    const { planId, planName, amount } = req.body;

    if (!planId || !planName || !amount) {
      return res
        .status(400)
        .json({
          error: "Missing required plan details: planId, planName, or amount.",
        });
    }

    const origin = req.get("origin") || `${req.protocol}://${req.get("host")}`;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${planName} Plan`,
                description: `Subscription to the Internet of Nature ${planName} plan.`,
              },
              unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?payment=success&plan=${planId}`,
        cancel_url: `${origin}/?payment=cancel`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Creation Error:", error);
      res
        .status(500)
        .json({
          error: error.message || "Failed to create Stripe checkout session.",
        });
    }
  });

  app.post("/api/notifications", (req, res) => {
    const notification = {
      id: Date.now(),
      ...req.body,
      time: "Just now",
      read: false,
    };
    notifications.unshift(notification);
    if (notifications.length > 10) notifications.pop();
    broadcast({ type: "NEW_NOTIFICATION", payload: notification });
    res.json(notification);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
