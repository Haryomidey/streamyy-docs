export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export const DOCS: DocSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: `
# Streamyy

Streamyy is a package-based calling infrastructure for 1-to-1 audio and video calls.

This repository is the source for the publishable packages.

The intended usage is simple:

- **frontend developers** install the frontend package
- **backend developers** install the backend package
- both sides communicate through the same signaling events and call lifecycle

### Important:

- Streamyy handles signaling, call state, presence, and socket orchestration
- Streamyy does not process audio or video media on the server
- media still flows peer-to-peer through WebRTC
- persistence is adapter-based, so storage is not tied to MongoDB
    `,
  },
  {
    id: "packages",
    title: "Packages",
    content: `
## Packages

### \`@streamyy/core\`
Shared internal/backend package for:
- call session types
- call statuses
- repositories
- persistence adapters
- service lifecycle logic

### \`@streamyy/server\`
Backend package developers install.
- Socket.IO signaling transport
- runtime bootstrap
- Express, Fastify, and NestJS integration
- 60-second ringing timeout by default
- persistence-agnostic setup

### \`@streamyy/client\`
Frontend package developers install.
- signaling client
- React hooks
- default install-ready UI
- ringtone support
- WebRTC helpers

### Official Adapters
- **@streamyy/mongoose**: MongoDB/Mongoose adapter
- **@streamyy/prisma**: Prisma adapter
- **@streamyy/postgres**: PostgreSQL adapter
- **@streamyy/redis**: Redis adapter for ephemeral state
- **@streamyy/supabase**: Supabase adapter
- **@streamyy/dynamodb**: DynamoDB adapter
    `,
  },
  {
    id: "persistence",
    title: "Persistence Modes",
    content: `
## Supported Persistence Modes

Right now Streamyy supports:

- **In-memory storage** (out of the box)
- **MongoDB** through \`@streamyy/mongoose\`
- **Prisma** through \`@streamyy/prisma\`
- **PostgreSQL** through \`@streamyy/postgres\`
- **Redis** through \`@streamyy/redis\`
- **Supabase** through \`@streamyy/supabase\`
- **DynamoDB** through \`@streamyy/dynamodb\`
- **Custom adapters** through the repository interfaces in \`@streamyy/core\`

That means you can support Prisma, PostgreSQL, MySQL, Redis, Supabase, DynamoDB, or your own custom persistence layer.
    `,
  },
  {
    id: "install",
    title: "Installation",
    content: `
## Who Installs What

### Backend developer
Install:
\`\`\`bash
npm install @streamyy/server
\`\`\`

### Frontend developer
Install:
\`\`\`bash
npm install @streamyy/client
\`\`\`
    `,
  },
  {
    id: "backend-usage",
    title: "Backend Usage",
    content: `
## Backend Usage

### 1. Create the runtime
This is the main backend entry point.

\`\`\`ts
import { createServer } from "node:http";
import express from "express";
import { createStreammyServer, registerExpressStreammyRoutes } from "@streamyy/server";

const app = express();
app.use(express.json());

const httpServer = createServer(app);

const streammy = createStreammyServer({
  httpServer,
  ringingTimeoutMs: 60_000,
  socket: {
    cors: { origin: "*" },
  },
  auth: async (token, handshake) => {
    if (!token) throw new Error("Missing auth token");
    return {
      userId: "user_123",
      deviceId: "web_browser",
      metadata: { authSource: "jwt", handshake },
    };
  },
});

streammy.bind();

registerExpressStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});

httpServer.listen(4000);
\`\`\`

### 1a. Use MongoDB/Mongoose
\`\`\`ts
import mongoose from "mongoose";
import { createMongoosePersistenceAdapter } from "@streamyy/mongoose";
import { createStreammyServer } from "@streamyy/server";

await mongoose.connect(process.env.MONGODB_URI!);

const streammy = createStreammyServer({
  httpServer,
  persistence: createMongoosePersistenceAdapter(mongoose),
});
\`\`\`

### 1b. Use your own persistence adapter
Implement the repository interfaces from \`@streamyy/core\`.

\`\`\`ts
import {
  defineStreammyPersistenceAdapter,
  type CallSessionRepository,
  type SocketConnectionRepository,
  type UserPresenceRepository,
} from "@streamyy/core";

const sessions: CallSessionRepository = {
  async create(session) { return session; },
  async findByCallId(callId) { return null; },
  async update(callId, update) { return null; },
};

// ... implement presence and connections ...

const persistence = defineStreammyPersistenceAdapter({
  sessions,
  presence,
  connections,
});

const streammy = createStreammyServer({
  httpServer,
  persistence,
});
\`\`\`
    `,
  },
  {
    id: "adapters",
    title: "Official Adapters",
    content: `
## Official Adapter Examples

### Prisma
\`\`\`ts
import { createPrismaPersistenceAdapter } from "@streamyy/prisma";

const persistence = createPrismaPersistenceAdapter({
  callSession: prisma.callSession,
  userPresence: prisma.userPresence,
  socketConnection: prisma.socketConnection,
});
\`\`\`

### PostgreSQL
\`\`\`ts
import { Pool } from "pg";
import { createPostgresPersistenceAdapter } from "@streamyy/postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const persistence = createPostgresPersistenceAdapter({ client: pool });
\`\`\`

### Redis
\`\`\`ts
import { createClient } from "redis";
import { createRedisPersistenceAdapter } from "@streamyy/redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const persistence = createRedisPersistenceAdapter({ client: redis });
\`\`\`

### Supabase
\`\`\`ts
import { createClient } from "@supabase/supabase-js";
import { createSupabasePersistenceAdapter } from "@streamyy/supabase";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const persistence = createSupabasePersistenceAdapter({
  callSession: supabase.from("streammy_call_sessions"),
  userPresence: supabase.from("streammy_user_presence"),
  socketConnection: supabase.from("streammy_socket_connections"),
});
\`\`\`

### DynamoDB
\`\`\`ts
import { createDynamoDbPersistenceAdapter } from "@streamyy/dynamodb";

const persistence = createDynamoDbPersistenceAdapter({
  client: dynamoDocumentClient,
});
\`\`\`
    `,
  },
  {
    id: "frameworks",
    title: "Framework Integrations",
    content: `
## Framework Integrations

### Express
\`\`\`ts
import express from "express";
import { registerExpressStreammyRoutes } from "@streamyy/server";

const app = express();
registerExpressStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
\`\`\`

### Fastify
\`\`\`ts
import Fastify from "fastify";
import { registerFastifyStreammyRoutes } from "@streamyy/server";

const app = Fastify();
registerFastifyStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
\`\`\`

### NestJS
\`\`\`ts
import { StreammyModule } from "@streamyy/server";

@Module({
  imports: [
    StreammyModule.forRoot({
      global: true,
      service: streammy.service,
      notifier: streammy.notifier,
    }),
  ],
})
export class AppModule {}
\`\`\`
    `,
  },
  {
    id: "http-api",
    title: "HTTP API",
    content: `
## HTTP API Routes

- \`GET /streammy/health\`
- \`POST /streammy/calls\`
- \`POST /streammy/calls/:callId/end\`

### Create a call over HTTP
\`\`\`http
POST /streammy/calls
Content-Type: application/json

{
  "callerId": "user_123",
  "receiverId": "user_456",
  "callType": "video",
  "metadata": {
    "conversationId": "conv_001"
  }
}
\`\`\`

### End a call over HTTP
\`\`\`http
POST /streammy/calls/call_123/end
Content-Type: application/json

{
  "userId": "user_123",
  "deviceId": "web_browser"
}
\`\`\`
    `,
  },
  {
    id: "frontend-usage",
    title: "Frontend Usage",
    content: `
## Frontend Usage

### 1. Use the default UI
\`\`\`tsx
import { StreammyCallWidget, StreammyProvider } from "@streamyy/client";

export function CallingPage() {
  return (
    <StreammyProvider
      options={{
        url: "http://localhost:4000",
        token: "jwt-token",
        userId: "user_123",
        deviceId: "web_browser",
        autoConnect: true,
      }}
    >
      <StreammyCallWidget
        defaultReceiverId="user_456"
        defaultCallType="video"
      />
    </StreammyProvider>
  );
}
\`\`\`

### 2. Customize ringtones
\`\`\`tsx
<StreammyCallWidget
  ringtones={{
    incoming: { kind: "url", src: "/sounds/incoming.mp3" },
    outgoing: { kind: "pattern", pattern: { steps: [{ frequency: 520, durationMs: 850, gain: 0.05 }], pauseMs: 1100 } },
  }}
/>
\`\`\`

### 3. Use the React hook
\`\`\`tsx
const { initiateCall, activeCall, callStatus } = useStreammy();
\`\`\`
    `,
  },
  {
    id: "flow",
    title: "Call Flow",
    content: `
## Typical Call Flow

1. Caller initiates the call.
2. Backend creates a call session.
3. Receiver gets \`call:incoming\`.
4. Receiver accepts or declines.
5. Offer, answer, and ICE candidates are exchanged.
6. Call becomes active.
7. If nobody answers within 60 seconds, the call becomes \`missed\`.
8. When either side ends the call, the backend stores \`endedAt\`, \`duration\`, and \`endedBy\`.

### Call States
- \`initiated\`, \`ringing\`, \`accepted\`, \`declined\`, \`missed\`, \`ongoing\`, \`ended\`, \`cancelled\`, \`failed\`
    `,
  },
];
