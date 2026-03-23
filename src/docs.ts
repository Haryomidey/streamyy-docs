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
# Streamyy Docs

Streamyy is a package-based calling infrastructure for 1-to-1 audio and video calls.

This documentation site explains how Streamyy is split across backend and frontend packages, how signaling and presence work, and how teams can use built-in adapters or plug in their own persistence layer.

## What Streamyy Handles

- signaling for call setup and teardown
- call lifecycle state management
- presence and connection tracking
- optional HTTP helper routes
- frontend helpers for React and WebRTC-driven flows
- persistence adapters for different storage backends

## What Streamyy Does Not Handle

- media processing on the server
- server-side audio or video transport
- replacing WebRTC peer-to-peer media exchange

Media still flows peer-to-peer through WebRTC.
    `,
  },
  {
    id: 'packages',
    title: 'Packages',
    content: `
## Core Packages

### \`@streamyy/core\`

Shared contracts and backend-facing primitives:

- call session types
- call statuses
- repository contracts
- persistence adapter helpers
- service lifecycle logic

### \`@streamyy/server\`

Backend package developers install.

Use it when you want:

- Socket.IO signaling transport
- runtime bootstrap
- Express integration
- Fastify integration
- Nest-style module registration
- default ringing timeout behavior
- persistence-agnostic backend setup

### \`@streamyy/client\`

Frontend package developers install.

Use it when you want:

- signaling client
- React provider and hooks
- default install-ready UI
- ringtone support
- reconnect-aware connection state
- WebRTC helper utilities
- reusable video layout components

## Official Adapter Packages

- \`@streamyy/mongoose\`
- \`@streamyy/prisma\`
- \`@streamyy/postgres\`
- \`@streamyy/redis\`
- \`@streamyy/supabase\`
- \`@streamyy/dynamodb\`
    `,
  },
  {
    id: 'persistence',
    title: 'Persistence',
    content: `
## Supported Persistence Modes

Streamyy supports:

- in-memory storage out of the box
- MongoDB through \`@streamyy/mongoose\`
- Prisma through \`@streamyy/prisma\`
- PostgreSQL through \`@streamyy/postgres\`
- Redis through \`@streamyy/redis\`
- Supabase through \`@streamyy/supabase\`
- DynamoDB through \`@streamyy/dynamodb\`
- custom adapters built from the repository interfaces in \`@streamyy/core\`

## Why This Design Matters

- the server runtime stays storage-agnostic
- backend teams can keep their existing database stack
- persistence can be swapped without rewriting call lifecycle logic
- durable and ephemeral storage strategies are both supported
    `,
  },
  {
    id: 'install',
    title: 'Installation',
    content: `
## Who Installs What

### Backend Teams

\`\`\`bash
npm install @streamyy/server
\`\`\`

Typical responsibilities:

- authenticate socket connections
- create and manage call sessions
- relay SDP and ICE signaling events
- track online users and device connections
- expose optional HTTP helper routes

### Frontend Teams

\`\`\`bash
npm install @streamyy/client
\`\`\`

Common exports:

- \`StreamyyClient\`
- \`StreamyyProvider\`
- \`useStreamyy()\`
- \`StreamyyCallWidget\`
- \`VideoStage\`
- \`VideoTile\`
- ringtone helpers
- WebRTC utilities
    `,
  },
  {
    id: 'backend-usage',
    title: 'Backend Usage',
    content: `
## Create the Runtime

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

## What the Runtime Does

- creates the call service
- starts Socket.IO internally
- binds Streamyy signaling handlers
- applies your auth callback during connection setup
- enforces a ringing timeout
- exposes helper HTTP routes if you register them

## Auth Return Shape

Typical auth data returned from your callback:

- \`userId\`
- \`deviceId\`
- optional \`metadata\`

This supports multi-device user rooms, targeted notifications, and presence tracking.
    `,
  },
  {
    id: 'adapters',
    title: 'Adapters',
    content: `
## MongoDB / Mongoose

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

\`\`\`bash
npm install @streamyy/server @streamyy/mongoose mongoose
\`\`\`

## Custom Adapter

\`\`\`ts
import {
  defineStreammyPersistenceAdapter,
  type CallSessionRepository,
  type SocketConnectionRepository,
  type UserPresenceRepository,
} from "@streamyy/core";

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
\`\`\`

## Other Official Adapters

- Prisma
- PostgreSQL
- Redis
- Supabase
- DynamoDB

All official adapters keep the same runtime shape and only swap the persistence implementation.
    `,
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    content: `
## Express Integration

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

## Fastify Integration

\`\`\`ts
import Fastify from "fastify";
import { registerFastifyStreammyRoutes } from "@streamyy/server";

const app = Fastify();

registerFastifyStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
\`\`\`

## Nest-Style Module Registration

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
## HTTP Helper Routes

- \`GET /streammy/health\`
- \`POST /streammy/calls\`
- \`POST /streammy/calls/:callId/end\`

## Create a Call Over HTTP

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

## End a Call Over HTTP

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
## Use the Default UI

\`\`\`tsx
import { StreamyyCallWidget, StreamyyProvider } from "@streamyy/client";

export function CallingPage() {
  return (
    <StreamyyProvider
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
      <StreamyyCallWidget
        defaultReceiverId="user_456"
        defaultCallType="video"
      />
    </StreamyyProvider>
  );
}
\`\`\`

The default UI gives you:

- a start-call form
- an incoming-call accept and decline surface
- a ready-made in-call layout
- local and remote media rendering
- mute and camera controls
- reconnect-aware UI state
- ringtone support
- render overrides for incoming and active call screens

## Customize Ringtones

\`\`\`tsx
<StreamyyCallWidget
  ringtones={{
    incoming: { kind: "url", src: "/sounds/incoming.mp3" },
    outgoing: { kind: "url", src: "/sounds/outgoing.mp3" },
  }}
/>
\`\`\`

\`\`\`tsx
<StreamyyCallWidget
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

## Override Widget Screens

\`\`\`tsx
<StreamyyCallWidget
  renderIncomingCall={({ call, accept, decline }) => (
    <MyIncomingCallSheet
      callerId={call.callerId}
      type={call.callType}
      onAccept={accept}
      onDecline={decline}
    />
  )}
  renderCallInterface={({ activeCall, media, toggleMute, toggleVideo, end }) => (
    <MyCallScreen
      call={activeCall}
      localStream={media.localStream}
      remoteStream={media.remoteStream}
      muted={media.muted}
      videoEnabled={media.videoEnabled}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
      onEnd={end}
    />
  )}
/>
\`\`\`

## Use the Client Directly

\`\`\`ts
import { createStreamyyClient } from "@streamyy/client";

const client = createStreamyyClient({
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

client.initiateCall("user_456", "audio", {
  conversationId: "conv_001",
});
\`\`\`

## Use the React Hook

\`\`\`tsx
import { StreamyyProvider, useStreamyy } from "@streamyy/client";

function CustomCallingUI() {
  const {
    connected,
    reconnecting,
    activeCall,
    callStatus,
    media,
    startAudioCall,
    startVideoCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useStreamyy();

  return (
    <div>
      <p>Connected: {String(connected)}</p>
      <p>Reconnecting: {String(reconnecting)}</p>
      <p>Status: {callStatus}</p>

      <button onClick={() => void startAudioCall("user_456")}>
        Start audio call
      </button>

      <button onClick={() => void startVideoCall("user_456")}>
        Start video call
      </button>

      {activeCall?.direction === "incoming" ? (
        <div>
          <button onClick={() => void acceptCall(activeCall.callId)}>Accept</button>
          <button onClick={() => void declineCall(activeCall.callId)}>Decline</button>
        </div>
      ) : null}

      {activeCall ? (
        <>
          <button onClick={() => toggleMute()}>{media.muted ? "Unmute" : "Mute"}</button>
          <button onClick={() => toggleVideo()}>{media.videoEnabled ? "Stop video" : "Start video"}</button>
          <button onClick={() => void endCall(activeCall.callId)}>End</button>
        </>
      ) : null}
    </div>
  );
}
\`\`\`
    `,
  },
  {
    id: 'signaling-events',
    title: 'Signaling',
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

- user connection registration
- multi-device user rooms
- incoming call notification
- accept, decline, cancel, and end transitions
- SDP and ICE relay
- presence updates
- ringing timeout handling
- adapter-based persistence

## Frontend Behavior

- outgoing and incoming call states
- reconnect-aware state handling
- low-bandwidth mode
- ringtone customization
- default UI and custom UI flows
- direct client usage and hook-based state management
    `,
  },
  {
    id: 'flow',
    title: 'Call Flow',
    content: `
## Typical Call Flow

1. The caller initiates a call.
2. The backend creates a call session and emits an incoming-call event.
3. The receiver accepts, declines, or ignores the call.
4. If accepted, the peers exchange offer, answer, and ICE candidates.
5. The call becomes active.
6. If nobody answers before the timeout, the session becomes \`missed\`.
7. When either side ends the call, the session is updated with final metadata.

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
    title: 'Docs Site',
    content: `
## Developing This Docs Site

This repository is a Vite + React + TypeScript documentation app.

Install dependencies:

\`\`\`bash
npm install
\`\`\`

Start the dev server:

\`\`\`bash
npm run dev
\`\`\`

Build for production:

\`\`\`bash
npm run build
\`\`\`

Preview the production build:

\`\`\`bash
npm run preview
\`\`\`

Run type-checking:

\`\`\`bash
npm run lint
\`\`\`

## Important Files

- \`README.md\`
- \`src/docs.ts\`
- \`src/App.tsx\`
- \`src/pages/DocPage.tsx\`
- \`src/components/Sidebar.tsx\`
- \`vercel.json\`

## Deployment

The Vercel config uses SPA rewrites so nested documentation routes resolve back to \`index.html\`.
    `,
  },
];
