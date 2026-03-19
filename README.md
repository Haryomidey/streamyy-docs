# Streamyy Docs

This repository contains the documentation site for **Streamyy**, a package-based calling infrastructure for 1-to-1 audio and video calls.

The docs explain how Streamyy is split across backend and frontend packages, how signaling works, how persistence is plugged in, and how teams can ship either a ready-made calling UI or a fully custom experience.

## What Streamyy Does

Streamyy gives product teams the application-layer pieces required to build calling features:

- signaling for call setup and teardown
- call lifecycle state management
- presence and connection tracking
- optional HTTP helper routes
- frontend helpers for React and WebRTC-driven flows
- persistence adapters so state is not tied to one database

Streamyy does **not** process audio or video on the server. Media still flows peer-to-peer through WebRTC.

## What This Repository Contains

This repo is the docs app, not the package workspace itself.

It includes:

- a Vite + React + TypeScript documentation frontend
- markdown-like documentation content stored in [`src/docs.ts`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/src/docs.ts)
- a landing and section-based docs layout
- Vercel routing config in [`vercel.json`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/vercel.json)

## Streamyy Package Map

### `@streamyy/core`

Shared contracts and backend-facing primitives:

- call session types
- call statuses
- repository interfaces
- persistence adapter helpers
- service lifecycle logic

### `@streamyy/server`

The backend package for application servers.

Use it when you want:

- Socket.IO signaling transport
- runtime bootstrap
- Express integration
- Fastify integration
- Nest-style module registration
- default ringing timeout behavior
- persistence-agnostic backend setup

### `@streamyy/client`

The frontend package for web clients.

Use it when you want:

- a signaling client
- React provider and hooks
- a default install-ready calling widget
- ringtone support
- reconnect-aware client state
- WebRTC helper utilities
- reusable video layout components

### Official Adapter Packages

Streamyy supports first-party persistence adapters for:

- `@streamyy/mongoose`
- `@streamyy/prisma`
- `@streamyy/postgres`
- `@streamyy/redis`
- `@streamyy/supabase`
- `@streamyy/dynamodb`

## Persistence Model

Streamyy is intentionally storage-agnostic. The backend runtime uses repository contracts rather than hardcoding a database.

Supported approaches:

- in-memory storage out of the box
- MongoDB through `@streamyy/mongoose`
- Prisma through `@streamyy/prisma`
- PostgreSQL through `@streamyy/postgres`
- Redis through `@streamyy/redis`
- Supabase through `@streamyy/supabase`
- DynamoDB through `@streamyy/dynamodb`
- any custom adapter that implements the `@streamyy/core` repository interfaces

This makes it easier to:

- keep your current database stack
- swap persistence without rewriting call logic
- use durable storage for call history
- use lightweight ephemeral storage for presence and connection tracking

## Who Installs What

### Backend teams

Install:

```bash
npm install @streamyy/server
```

Typical responsibilities:

- authenticate socket connections
- create and manage call sessions
- relay SDP and ICE signaling events
- track online users and device connections
- expose helper HTTP routes if needed

### Frontend teams

Install:

```bash
npm install @streamyy/client
```

Typical exports:

- `StreamyyClient`
- `StreamyyProvider`
- `useStreamyy()`
- `StreamyyCallWidget`
- `VideoStage`
- `VideoTile`
- ringtone configuration helpers
- WebRTC helper utilities

## Backend Quick Start

The server package handles signaling, lifecycle updates, and connection orchestration. A minimal Express setup looks like this:

```ts
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
```

What this runtime is doing:

- creating the call service
- starting the Socket.IO transport internally
- binding Streamyy signaling handlers
- applying your auth callback during connection setup
- enforcing a ringing timeout for unanswered calls
- exposing optional HTTP routes for health checks and server-side call actions

### Auth Shape

Your auth function should return enough identity information for Streamyy to map sockets to users and devices.

Common fields:

- `userId`
- `deviceId`
- optional `metadata`

That allows the backend to support:

- multi-device user rooms
- presence updates
- targeted incoming-call delivery
- clean socket connection tracking

## Persistent Storage Example

If you want call records and presence state to survive restarts, pass a persistence adapter.

### MongoDB / Mongoose

```ts
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
```

Install:

```bash
npm install @streamyy/server @streamyy/mongoose mongoose
```

### Custom Adapter

If your team already uses another database, implement the repositories from `@streamyy/core` and inject them into the runtime.

```ts
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
```

This is useful when you want to keep Streamyy’s runtime behavior but plug it into your own data layer.

## Official Adapter Examples

### Prisma

```bash
npm install @streamyy/server @streamyy/prisma
```

```ts
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
```

### PostgreSQL

```bash
npm install @streamyy/server @streamyy/postgres pg
```

```ts
import { Pool } from "pg";
import { createPostgresPersistenceAdapter } from "@streamyy/postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const persistence = createPostgresPersistenceAdapter({
  client: pool,
});
```

### Redis

```bash
npm install @streamyy/server @streamyy/redis redis
```

```ts
import { createClient } from "redis";
import { createRedisPersistenceAdapter } from "@streamyy/redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const persistence = createRedisPersistenceAdapter({
  client: redis,
});
```

### Supabase

```bash
npm install @streamyy/server @streamyy/supabase @supabase/supabase-js
```

```ts
import { createClient } from "@supabase/supabase-js";
import { createSupabasePersistenceAdapter } from "@streamyy/supabase";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const persistence = createSupabasePersistenceAdapter({
  callSession: supabase.from("streammy_call_sessions"),
  userPresence: supabase.from("streammy_user_presence"),
  socketConnection: supabase.from("streammy_socket_connections"),
});
```

### DynamoDB

```bash
npm install @streamyy/server @streamyy/dynamodb @aws-sdk/lib-dynamodb
```

```ts
import { createDynamoDbPersistenceAdapter } from "@streamyy/dynamodb";

const persistence = createDynamoDbPersistenceAdapter({
  client: dynamoDocumentClient,
});
```

## Framework Integrations

### Express

```ts
import express from "express";
import { registerExpressStreammyRoutes } from "@streamyy/server";

const app = express();
app.use(express.json());

registerExpressStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
```

### Fastify

```ts
import Fastify from "fastify";
import { registerFastifyStreammyRoutes } from "@streamyy/server";

const app = Fastify();

registerFastifyStreammyRoutes(app, {
  service: streammy.service,
  basePath: "/streammy",
});
```

### Nest-Style Module Registration

```ts
import { StreammyModule } from "@streamyy/server";

const streammyModule = StreammyModule.forRoot({
  global: true,
  service: streammy.service,
  notifier: streammy.notifier,
});
```

## HTTP Routes

When registered, Streamyy can expose helper endpoints such as:

- `GET /streammy/health`
- `POST /streammy/calls`
- `POST /streammy/calls/:callId/end`

### Create a Call Over HTTP

```http
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
```

### End a Call Over HTTP

```http
POST /streammy/calls/call_123/end
Content-Type: application/json

{
  "userId": "user_123",
  "deviceId": "web_browser"
}
```

## Frontend Quick Start

The fastest way to ship a working calling UI is to use the provider plus the default widget.

```tsx
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
```

The default UI gives you:

- a start-call form
- an incoming-call accept and decline surface
- a ready-made in-call layout
- local and remote media rendering
- mute and camera controls
- end-call controls
- reconnect-aware UI state
- built-in ringtone behavior
- render overrides for incoming and active call screens

## Frontend Customization

### Custom Ringtones

You can use either hosted files or generated tone patterns.

```tsx
<StreamyyCallWidget
  ringtones={{
    incoming: { kind: "url", src: "/sounds/incoming.mp3" },
    outgoing: { kind: "url", src: "/sounds/outgoing.mp3" },
  }}
/>
```

```tsx
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
```

### Override Incoming and Active Call Screens

```tsx
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
```

## Low-Level Frontend APIs

If the widget is too opinionated, you can work directly with the client or the hook.

### Client API

```ts
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

client.on("callAccepted", (payload) => {
  console.log("Accepted", payload);
});

client.on("callEnded", (payload) => {
  console.log("Ended", payload.status, payload.reason);
});

client.initiateCall("user_456", "audio", {
  conversationId: "conv_001",
});
```

### React Hook

```tsx
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
```

### WebRTC Helpers

```ts
import { getUserMedia, toggleStreamTracks } from "@streamyy/client";

const localStream = await getUserMedia({
  audio: true,
  video: true,
});

toggleStreamTracks(localStream, "audio", false);
toggleStreamTracks(localStream, "video", true);
```

```ts
import { StreamyyPeerSession } from "@streamyy/client";

const peer = new StreamyyPeerSession({
  client,
  callId: "call_123",
  remoteUserId: "user_456",
});

peer.attachLocalStream(localStream);

const offer = await peer.createOffer();
client.sendOffer("call_123", "user_456", offer);
```

### Video Layout Helpers

```tsx
import { VideoStage } from "@streamyy/client";

<VideoStage
  localStream={localStream}
  remoteStream={remoteStream}
  localLabel="You"
  remoteLabel="Ada"
  defaultMainView="remote"
/>
```

Expected behavior:

- remote video is the primary view by default
- local video appears in a smaller preview tile
- clicking the smaller tile swaps focus
- local video is not mirrored unless you opt in

If you want selfie-style preview behavior:

```tsx
import { VideoTile } from "@streamyy/client";

<VideoTile
  stream={localStream}
  label="Local preview"
  mirrored={true}
/>
```

## Signaling Contract

Socket events used by the packages:

- `call:initiate`
- `call:incoming`
- `call:accept`
- `call:decline`
- `call:cancel`
- `call:end`
- `call:offer`
- `call:answer`
- `call:ice-candidate`
- `presence:update`

## Call States

Statuses used by Streamyy:

- `initiated`
- `ringing`
- `accepted`
- `declined`
- `missed`
- `ongoing`
- `ended`
- `cancelled`
- `failed`

## Typical Call Flow

1. The caller initiates a call.
2. The backend creates a call session and emits an incoming-call event.
3. The receiver accepts, declines, or ignores the call.
4. If accepted, offer, answer, and ICE candidates are exchanged.
5. The call moves into an active state.
6. If the timeout expires before acceptance, the call is marked as missed.
7. When either side ends the call, the session is updated with final metadata such as duration and ended-by information.

## Backend Behavior Summary

The server package is responsible for:

- user connection registration
- multi-device user rooms
- incoming call notification
- accept, decline, cancel, and end transitions
- SDP and ICE relay
- presence updates
- ringing timeout handling
- adapter-based persistence

## Frontend Behavior Summary

The client package supports:

- outgoing and incoming call states
- reconnect-aware status handling
- low-bandwidth client mode
- ringtone customization
- default UI and custom UI flows
- direct client usage and hook-based state management

## Developing This Docs Site

This repo itself runs as a Vite React application.

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run type-checking:

```bash
npm run lint
```

## Project Structure

Important files in this repo:

- [`README.md`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/README.md)
- [`src/docs.ts`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/src/docs.ts)
- [`src/App.tsx`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/src/App.tsx)
- [`src/pages/DocPage.tsx`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/src/pages/DocPage.tsx)
- [`src/components/Sidebar.tsx`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/src/components/Sidebar.tsx)
- [`vercel.json`](c:/Users/USER/Desktop/programming/javascript/react/project/streamyy-docs/vercel.json)

## Deployment Notes

The project is configured for Vercel with SPA rewrites so nested documentation routes resolve back to `index.html`.

That means routes like `/packages` or `/frontend-usage` can load correctly in production without requiring server-side rendered pages.
