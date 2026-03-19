export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export const DOCS: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `
# Streamyy

Streamyy is a package-based calling infrastructure for 1-to-1 audio and video calls.

This repository is the source for the publishable packages.

The intended usage is simple:

- frontend developers install the frontend package
- backend developers install the backend package
- both sides communicate through the same signaling events and call lifecycle

## Important

- Streamyy handles signaling, call state, presence, and socket orchestration
- Streamyy does not process audio or video media on the server
- media still flows peer-to-peer through WebRTC
- persistence is adapter-based, so storage is not tied to MongoDB

## What This Docs Site Covers

- package responsibilities across backend and frontend
- persistence options and official adapters
- backend setup with Express, Fastify, and Nest-style registration
- frontend setup with the default widget, hooks, and low-level client APIs
- signaling events, call states, and workspace commands
    `,
  },
  {
    id: 'packages',
    title: 'Packages',
    content: `
## Core Packages

### \`@streamyy/core\`

Shared internal and backend-facing package for:

- call session types
- call statuses
- repository contracts
- persistence adapters
- service lifecycle logic

### \`@streamyy/server\`

Backend package developers install.

Use it when you want:

- Socket.IO signaling transport
- runtime bootstrap
- Express integration
- Fastify integration
- Nest-style module integration
- 60-second ringing timeout by default
- persistence-agnostic backend setup

### \`@streamyy/client\`

Frontend package developers install.

Use it when you want:

- signaling client
- React hooks
- default install-ready UI
- ringtone support
- reconnect-aware connection state
- WebRTC helpers

## Official Adapter Packages

- \`@streamyy/mongoose\`
- \`@streamyy/prisma\`
- \`@streamyy/postgres\`
- \`@streamyy/redis\`
- \`@streamyy/supabase\`
- \`@streamyy/dynamodb\`

Each adapter package includes its own README and integration examples where relevant.
    `,
  },
  {
    id: 'persistence',
    title: 'Persistence Modes',
    content: `
## Supported Persistence Modes

Right now Streamyy supports:

- in-memory storage out of the box
- MongoDB through \`@streamyy/mongoose\`
- Prisma through \`@streamyy/prisma\`
- PostgreSQL through \`@streamyy/postgres\`
- Redis through \`@streamyy/redis\`
- Supabase through \`@streamyy/supabase\`
- DynamoDB through \`@streamyy/dynamodb\`
- custom adapters through the repository interfaces in \`@streamyy/core\`

That means you can support:

- Prisma
- PostgreSQL
- MySQL
- Redis
- Supabase
- DynamoDB
- your own custom persistence layer

## Why This Matters

- \`@streamyy/server\` stays storage-agnostic
- backend teams can keep their existing database stack
- persistence can be swapped without rewriting the call lifecycle logic
    `,
  },
  {
    id: 'install',
    title: 'Installation',
    content: `
## Who Installs What

### Backend developer

Install:

\`\`\`bash
npm install @streamyy/server
\`\`\`

What they get:

- runtime bootstrap
- signaling handlers
- call session management
- presence tracking
- HTTP helper routes

### Frontend developer

Install:

\`\`\`bash
npm install @streamyy/client
\`\`\`

What they get:

- \`StreammyClient\`
- \`StreammyProvider\`
- \`useStreammy()\`
- \`StreammyCallWidget\`
- \`VideoStage\`
- ringtone configuration
- WebRTC helper utilities
    `,
  },
  {
    id: 'backend-usage',
    title: 'Backend Usage',
    content: `
## 1. Create the Runtime

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
    cors: {
      origin: "*",
    },
  },
  auth: async (token, handshake) => {
    if (!token) {
      throw new Error("Missing auth token");
    }

    return {
      userId: "user_123",
      deviceId: "web_browser",
      metadata: {
        authSource: "jwt",
        handshake,
      },
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

What this does:

- creates the call service
- creates the Socket.IO server internally
- binds Socket.IO events internally
- handles authentication
- enables ringing timeout
- exposes optional HTTP routes
- uses in-memory storage by default unless you pass a persistence adapter

## 1a. Use MongoDB/Mongoose If You Want Persistent Storage

\`\`\`ts
import mongoose from "mongoose";
import { createServer } from "node:http";
import express from "express";
import { createMongoosePersistenceAdapter } from "@streamyy/mongoose";
import { createStreammyServer } from "@streamyy/server";

await mongoose.connect(process.env.MONGODB_URI!);

const app = express();
const httpServer = createServer(app);

const streammy = createStreammyServer({
  httpServer,
  persistence: createMongoosePersistenceAdapter(mongoose),
});
\`\`\`

Install for this option:

\`\`\`bash
npm install @streamyy/server @streamyy/mongoose mongoose
\`\`\`

## 1b. Use Your Own Persistence Adapter

\`\`\`ts
import {
  defineStreammyPersistenceAdapter,
  type CallSessionRepository,
  type SocketConnectionRepository,
  type UserPresenceRepository,
} from "@streamyy/core";
import { createStreammyServer } from "@streamyy/server";

const sessions: CallSessionRepository = {
  async create(session) {
    return session;
  },
  async findByCallId(callId) {
    return null;
  },
  async update(callId, update) {
    return null;
  },
};

const presence: UserPresenceRepository = {
  async upsert(record) {
    return record;
  },
  async findByUserId(userId) {
    return null;
  },
};

const connections: SocketConnectionRepository = {
  async upsert(record) {
    return record;
  },
  async deleteByConnectionId(connectionId) {
    return null;
  },
  async findByConnectionId(connectionId) {
    return null;
  },
  async findByUserId(userId) {
    return [];
  },
  async countByUserId(userId) {
    return 0;
  },
};

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

What this gives you:

- Streamyy server logic stays the same
- only the storage adapter changes
- backend teams can keep using their existing database stack
    `,
  },
  {
    id: 'adapters',
    title: 'Official Adapters',
    content: `
## Official Adapter Package Examples

### Prisma

Install:

\`\`\`bash
npm install @streamyy/server @streamyy/prisma
\`\`\`

Usage:

\`\`\`ts
import { createPrismaPersistenceAdapter } from "@streamyy/prisma";

const persistence = createPrismaPersistenceAdapter({
  callSession: prisma.callSession,
  userPresence: prisma.userPresence,
  socketConnection: prisma.socketConnection,
});

const streammy = createStreammyServer({
  httpServer,
  persistence,
});
\`\`\`

### PostgreSQL

\`\`\`bash
npm install @streamyy/server @streamyy/postgres pg
\`\`\`

\`\`\`ts
import { Pool } from "pg";
import { createPostgresPersistenceAdapter } from "@streamyy/postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const persistence = createPostgresPersistenceAdapter({
  client: pool,
});
\`\`\`

### Redis

\`\`\`bash
npm install @streamyy/server @streamyy/redis redis
\`\`\`

\`\`\`ts
import { createClient } from "redis";
import { createRedisPersistenceAdapter } from "@streamyy/redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const persistence = createRedisPersistenceAdapter({
  client: redis,
});
\`\`\`

### Supabase

\`\`\`bash
npm install @streamyy/server @streamyy/supabase @supabase/supabase-js
\`\`\`

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

\`\`\`bash
npm install @streamyy/server @streamyy/dynamodb @aws-sdk/lib-dynamodb
\`\`\`

\`\`\`ts
import { createDynamoDbPersistenceAdapter } from "@streamyy/dynamodb";

const persistence = createDynamoDbPersistenceAdapter({
  client: dynamoDocumentClient,
});
\`\`\`
    `,
  },
  {
    id: 'frameworks',
    title: 'Framework Integrations',
    content: `
## 2. Express Integration

\`\`\`ts
import express from "express";
import { registerExpressStreammyRoutes } from "@streamyy/server";

const app = express();
app.use(express.json());

registerExpressStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
\`\`\`

## 3. Fastify Integration

\`\`\`ts
import Fastify from "fastify";
import { registerFastifyStreammyRoutes } from "@streamyy/server";

const app = Fastify();

registerFastifyStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
\`\`\`

## 4. Nest-Style Integration

\`\`\`ts
import { StreammyModule } from "@streamyy/server";

const streammyModule = StreammyModule.forRoot({
  global: true,
  service: streammy.service,
  notifier: streammy.notifier,
});
\`\`\`
    `,
  },
  {
    id: 'http-api',
    title: 'HTTP API',
    content: `
## HTTP API Routes

- \`GET /streammy/health\`
- \`POST /streammy/calls\`
- \`POST /streammy/calls/:callId/end\`

### Create a Call Over HTTP

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

### End a Call Over HTTP

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
    id: 'frontend-usage',
    title: 'Frontend Usage',
    content: `
## 1. Use the Default UI

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
        lowBandwidthMode: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelayMs: 1000,
        reconnectionDelayMaxMs: 5000,
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

What the default UI gives you:

- start call form
- current call state
- incoming call accept and decline panel
- mute and video toggles
- end-call action
- reconnect status
- built-in ringtone behavior
- non-mirrored video by default

## 2. Customize Ringtones

\`\`\`tsx
<StreammyCallWidget
  ringtones={{
    incoming: {
      kind: "pattern",
      pattern: {
        steps: [
          { frequency: 880, durationMs: 220, gain: 0.06 },
          { frequency: 660, durationMs: 220, gain: 0.06 },
        ],
        pauseMs: 900,
      },
    },
    outgoing: {
      kind: "pattern",
      pattern: {
        steps: [{ frequency: 520, durationMs: 850, gain: 0.05 }],
        pauseMs: 1100,
      },
    },
  }}
/>
\`\`\`

## 3. Use the Client Directly

\`\`\`ts
import { createStreammyClient } from "@streamyy/client";

const client = createStreammyClient({
  url: "http://localhost:4000",
  token: "jwt-token",
  userId: "user_123",
  deviceId: "web_browser",
  autoConnect: true,
  lowBandwidthMode: true,
  reconnection: true,
});

client.on("incomingCall", (call) => {
  console.log("Incoming call", call);
});

client.on("callAccepted", (payload) => {
  console.log("Accepted", payload);
});

client.on("callEnded", (payload) => {
  console.log("Ended", payload.status, payload.reason);
});

client.initiateCall("user_456", "audio", {
  conversationId: "conv_001",
});
\`\`\`

## 4. Use the React Hook

\`\`\`tsx
import { StreammyProvider, useStreammy } from "@streamyy/client";

function CustomCallingUI() {
  const {
    connected,
    reconnecting,
    activeCall,
    callStatus,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
  } = useStreammy();

  return (
    <div>
      <p>Connected: {String(connected)}</p>
      <p>Reconnecting: {String(reconnecting)}</p>
      <p>Status: {callStatus}</p>

      <button onClick={() => initiateCall("user_456", "video")}>
        Start call
      </button>

      {activeCall?.direction === "incoming" ? (
        <div>
          <button onClick={() => acceptCall(activeCall.callId)}>Accept</button>
          <button onClick={() => declineCall(activeCall.callId)}>Decline</button>
        </div>
      ) : null}

      {activeCall ? (
        <button onClick={() => endCall(activeCall.callId)}>End</button>
      ) : null}
    </div>
  );
}
\`\`\`

## 5. WebRTC Helpers

\`\`\`ts
import { getUserMedia, toggleStreamTracks } from "@streamyy/client";

const localStream = await getUserMedia({
  audio: true,
  video: true,
});

toggleStreamTracks(localStream, "audio", false);
toggleStreamTracks(localStream, "video", true);
\`\`\`

\`\`\`ts
import { StreammyPeerSession } from "@streamyy/client";

const peer = new StreammyPeerSession({
  client,
  callId: "call_123",
  remoteUserId: "user_456",
});

peer.attachLocalStream(localStream);

const offer = await peer.createOffer();
client.sendOffer("call_123", "user_456", offer);
\`\`\`

## 6. WhatsApp-Style Video Swap Layout

\`\`\`tsx
import { VideoStage } from "@streamyy/client";

<VideoStage
  localStream={localStream}
  remoteStream={remoteStream}
  localLabel="You"
  remoteLabel="Ada"
  defaultMainView="remote"
/>
\`\`\`

Behavior:

- remote video is large by default
- local video appears in the smaller corner tile
- clicking the smaller tile swaps the focus
- local video is not mirrored unless you opt in
    `,
  },
  {
    id: 'signaling-events',
    title: 'Signaling Events',
    content: `
## Signaling Events

Socket events used by the packages:

- \`call:initiate\`
- \`call:incoming\`
- \`call:accept\`
- \`call:decline\`
- \`call:cancel\`
- \`call:end\`
- \`call:offer\`
- \`call:answer\`
- \`call:ice-candidate\`
- \`presence:update\`

## Backend Behavior

The backend package handles:

- user connection registration
- multi-device user rooms
- incoming call notification
- accept, decline, cancel, and end events
- SDP and ICE relay
- presence updates
- missed call timeout after 60 seconds
- internal Socket.IO setup, so backend users do not need to install or create Socket.IO manually
- in-memory storage by default
- custom persistence via adapter injection

## Frontend Behavior

The frontend package currently supports:

- outgoing and incoming call states
- reconnect-aware status
- low-bandwidth client mode
- different incoming and outgoing ringtones
- custom ringtone sources
- default call UI
- custom UI through hooks and client access
    `,
  },
  {
    id: 'flow',
    title: 'Call Flow',
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

## Call States

- \`initiated\`
- \`ringing\`
- \`accepted\`
- \`declined\`
- \`missed\`
- \`ongoing\`
- \`ended\`
- \`cancelled\`
- \`failed\`
    `,
  },
  {
    id: 'workspace-commands',
    title: 'Workspace Commands',
    content: `
## Workspace Commands

These are for working on the package source in this repository.

Install workspace dependencies:

\`\`\`bash
npm install
\`\`\`

Build all packages:

\`\`\`bash
npm run build
\`\`\`

Build only backend package:

\`\`\`bash
npm run build:server
\`\`\`

Build only Mongoose adapter package:

\`\`\`bash
npm run build:mongoose
\`\`\`

Build the other adapter packages:

\`\`\`bash
npm run build:prisma
npm run build:postgres
npm run build:redis
npm run build:supabase
npm run build:dynamodb
\`\`\`

Build only frontend package:

\`\`\`bash
npm run build:frontend
\`\`\`

Build only core package:

\`\`\`bash
npm run build:core
\`\`\`
    `,
  },
];
