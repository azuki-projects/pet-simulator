import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  badge?: string;
  text: string;
  timestamp: string;
  createdAt: number;
}

const app = express();
app.use(express.json());

const server = http.createServer(app);

// Data storage for chat messages
const DATA_DIR = path.resolve('src/data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const CHAT_FILE = path.join(DATA_DIR, 'global_chat.json');

let messages: ChatMessage[] = [];

try {
  if (fs.existsSync(CHAT_FILE)) {
    const raw = fs.readFileSync(CHAT_FILE, 'utf-8');
    messages = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Could not load existing chat file, starting fresh:', e);
}

// Initial system message if empty
if (messages.length === 0) {
  messages = [
    {
      id: 'sys_welcome',
      sender: 'Azuki Realm',
      avatar: '⛩️',
      badge: 'OFFICIAL',
      text: 'Real Online Global Chat is live! Chat with other trainers across the realm (3-second cooldown per message).',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    },
  ];
}

const saveMessagesToDisk = () => {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(messages.slice(-150), null, 2));
  } catch (e) {
    console.error('Failed to save chat to disk:', e);
  }
};

// Cooldown tracker: Map of clientId/IP -> timestamp of last message
const clientCooldowns = new Map<string, number>();

// WebSocket Server attached to HTTP server
const wss = new WebSocketServer({ server, path: '/ws/chat' });

const broadcast = (data: Record<string, unknown>) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

const getOnlineCount = () => Math.max(1, wss.clients.size);

wss.on('connection', (ws: WebSocket, req) => {
  // Send current state and online count to freshly connected client
  ws.send(
    JSON.stringify({
      type: 'init',
      messages: messages.slice(-100),
      onlineCount: getOnlineCount(),
    })
  );

  // Broadcast updated count
  broadcast({
    type: 'online_count',
    onlineCount: getOnlineCount(),
  });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === 'chat:send') {
        const clientId = data.clientId || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const lastSent = clientCooldowns.get(clientId) || 0;
        const elapsed = now - lastSent;

        // 3 SECONDS COOLDOWN ENFORCEMENT
        if (elapsed < 3000) {
          const waitTime = Math.ceil((3000 - elapsed) / 1000);
          ws.send(
            JSON.stringify({
              type: 'error:cooldown',
              message: `Slow down! You can reply again in ${waitTime}s.`,
              remainingSeconds: waitTime,
            })
          );
          return;
        }

        const text = String(data.text || '').trim();
        if (!text || text.length > 200) {
          return;
        }

        const sender = String(data.sender || 'Trainer').trim().slice(0, 24);
        const avatar = String(data.avatar || '🐾').slice(0, 4);
        const badge = data.badge ? String(data.badge).slice(0, 12) : undefined;

        clientCooldowns.set(clientId, now);

        const newMsg: ChatMessage = {
          id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
          sender,
          avatar,
          badge,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now,
        };

        messages.push(newMsg);
        if (messages.length > 150) {
          messages = messages.slice(-150);
        }
        saveMessagesToDisk();

        // Broadcast real message to all online users
        broadcast({
          type: 'message:new',
          message: newMsg,
        });

        // Acknowledge cooldown on sender client
        ws.send(
          JSON.stringify({
            type: 'cooldown:started',
            cooldownSeconds: 3,
          })
        );
      }
    } catch (e) {
      console.error('Error parsing WS message:', e);
    }
  });

  ws.on('close', () => {
    broadcast({
      type: 'online_count',
      onlineCount: getOnlineCount(),
    });
  });
});

// HTTP REST Endpoints (for initial fallback / polling if WS ever drops)
app.get('/api/chat/messages', (_req: Request, res: Response) => {
  res.json({
    messages: messages.slice(-100),
    onlineCount: getOnlineCount(),
  });
});

app.post('/api/chat/messages', (req: Request, res: Response) => {
  const { sender, avatar, badge, text, clientId } = req.body;
  const clientKey = clientId || req.ip || 'unknown';
  const now = Date.now();
  const lastSent = clientCooldowns.get(clientKey) || 0;
  const elapsed = now - lastSent;

  if (elapsed < 3000) {
    const waitTime = Math.ceil((3000 - elapsed) / 1000);
    return res.status(429).json({
      error: `Please wait ${waitTime}s before sending another message.`,
      remainingSeconds: waitTime,
    });
  }

  const cleanText = String(text || '').trim();
  if (!cleanText || cleanText.length > 200) {
    return res.status(400).json({ error: 'Invalid message length.' });
  }

  clientCooldowns.set(clientKey, now);

  const newMsg: ChatMessage = {
    id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
    sender: String(sender || 'Trainer').trim().slice(0, 24),
    avatar: String(avatar || '🐾').slice(0, 4),
    badge: badge ? String(badge).slice(0, 12) : undefined,
    text: cleanText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: now,
  };

  messages.push(newMsg);
  if (messages.length > 150) {
    messages = messages.slice(-150);
  }
  saveMessagesToDisk();

  broadcast({
    type: 'message:new',
    message: newMsg,
  });

  return res.json({ success: true, message: newMsg, cooldownSeconds: 3 });
});

// Serve frontend in production or via Vite in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Azuki Pet Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
