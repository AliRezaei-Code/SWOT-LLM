# Actium Defence Training Platform — Step‑by‑Step Implementation Guide

> **Goal:** Translate the strategy into a sequenced, ticket‑ready execution plan that a small team can implement from a fresh repo to a public launch. Assumes **Next.js 15 App Router**, **TypeScript**, **Prisma + PostgreSQL**, **Vercel**, **Clerk**, **Mux**, **Vercel Blob**, **Inngest**, **Resend**, **PostHog**, **Sentry**, **Upstash**.

---

## 0) Repo & Environment Bootstrapping (Day 0)

**0.1 Create monorepo skeleton**
- `apps/web` — Next.js (App Router)
- `packages/ui` — shared components (shadcn/ui)
- `packages/config` — tsconfig, eslint, tailwind presets

```bash
# Prereqs: pnpm >= 9, Node 20, Docker (optional)
mkdir actium && cd actium
pnpm dlx create-turbo@latest -e with-tailwind actium
cd actium
pnpm install
```

**0.2 Baseline config**
- Add files: `.nvmrc`, `.editorconfig`, `turbo.json`, `tsconfig.base.json`, `.gitignore`.
- Enable shadcn/ui in `apps/web`.

```bash
cd apps/web
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button card input textarea dialog dropdown-menu avatar progress badge tabs toast scroll-area skeleton
```

**0.3 Vercel project & envs**
- Create Vercel project (Production → `main`, Preview → PRs, Development → local).
- Add environment variables placeholders (see §9.1).

**0.4 GitHub & CI**
- Connect repo to Vercel.
- Add CI workflow (see §10). Protect `main` branch (require CI).

---

## 1) Database & Prisma (Day 1–2)

**1.1 Provision Postgres**
- Use Neon, Supabase, or Railway. Create **prod**, **staging**, **dev** DBs.

**1.2 Add Prisma**
```bash
cd apps/web
pnpm add -D prisma
pnpm add @prisma/client
pnpm prisma init --datasource-provider postgresql
```

**1.3 Schema**
- Paste the provided schema (Users, Courses, Modules, Lessons, Resources, MuxData, Enrollment, LessonProgress, CourseSchedule, StudentScheduleSubscription).
- Add indices noted in the blueprint.

```prisma
// apps/web/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum ResourceType {
  VIDEO
  FILE
  LINK
}

model User {
  id             String        @id @default(cuid())
  clerkId        String        @unique
  email          String        @unique
  firstName      String?
  lastName       String?
  fullName       String
  imageUrl       String?
  role           UserRole      @default(STUDENT)
  timezone       String?
  calendarSecret String        @unique @default(uuid())
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  courses                Course[]                   @relation("CourseInstructor")
  enrollments            Enrollment[]
  lessonProgress         LessonProgress[]
  scheduleSubscriptions  StudentScheduleSubscription[]
  auditLogs              AuditLog[]

  @@index([role])
}

model Course {
  id             String      @id @default(cuid())
  instructorId   String
  title          String
  slug           String      @unique
  description    String
  thumbnailUrl   String?
  isPublished    Boolean     @default(false)
  publishedAt    DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  instructor User    @relation("CourseInstructor", fields: [instructorId], references: [id])
  modules    Module[]
  schedules  CourseSchedule[]
  resources  Resource[]
  enrollments Enrollment[]

  @@index([instructorId])
  @@index([isPublished, publishedAt])
}

model Module {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  description String?
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course  Course  @relation(fields: [courseId], references: [id])
  lessons Lesson[]

  @@index([courseId])
  @@unique([courseId, order])
}

model Lesson {
  id            String   @id @default(cuid())
  moduleId      String
  title         String
  slug          String   @unique
  summary       String?
  content       String?
  order         Int
  estimatedDuration Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  module    Module    @relation(fields: [moduleId], references: [id])
  resources Resource[]
  progress  LessonProgress[]

  @@index([moduleId])
  @@unique([moduleId, order])
}

model Resource {
  id          String       @id @default(cuid())
  lessonId    String
  type        ResourceType
  title       String
  description String?
  url         String
  blobKey     String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  lesson  Lesson  @relation(fields: [lessonId], references: [id])
  muxData MuxData?

  @@index([lessonId])
}

model MuxData {
  id            String   @id @default(cuid())
  resourceId    String   @unique
  assetId       String   @unique
  playbackId    String   @unique
  duration      Int?
  status        String   @default("pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  resource Resource @relation(fields: [resourceId], references: [id])
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  lessonProgress LessonProgress[]

  @@unique([userId, courseId], name: "userId_courseId")
  @@index([courseId])
}

model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  lesson Lesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId], name: "userId_lessonId")
  @@index([lessonId])
}

model CourseSchedule {
  id        String   @id @default(cuid())
  courseId  String
  title     String?
  startTime DateTime
  endTime   DateTime
  timezone  String
  location  String?
  capacity  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course Course @relation(fields: [courseId], references: [id])
  subscriptions StudentScheduleSubscription[]

  @@index([courseId])
  @@index([startTime])
}

model StudentScheduleSubscription {
  id         String        @id @default(cuid())
  userId     String
  scheduleId String
  createdAt  DateTime      @default(now())

  user     User           @relation(fields: [userId], references: [id])
  schedule CourseSchedule @relation(fields: [scheduleId], references: [id])

  @@unique([userId, scheduleId])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  metadata    Json?
  ipAddress   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
}
```

**1.4 Migrations**
```bash
# local
export DATABASE_URL='postgresql://...dev'
pnpm prisma migrate dev --name init
pnpm prisma generate
```

**1.5 Seed script (optional)**
- Create `prisma/seed.ts` to insert a demo instructor, course skeleton, and sample lessons.

```ts
// apps/web/prisma/seed.ts
import { PrismaClient, UserRole, ResourceType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: { role: UserRole.INSTRUCTOR, fullName: 'Demo Instructor' },
    create: {
      clerkId: 'demo-instructor',
      email: 'instructor@example.com',
      fullName: 'Demo Instructor',
      role: UserRole.INSTRUCTOR,
      timezone: 'UTC',
    },
  })

  const course = await prisma.course.upsert({
    where: { slug: 'defence-fundamentals' },
    update: {},
    create: {
      instructorId: instructor.id,
      title: 'Defence Fundamentals',
      slug: 'defence-fundamentals',
      description: 'Baseline curriculum covering operations, strategy, and threat modelling.',
      isPublished: true,
      publishedAt: new Date(),
    },
  })

  const modules = await prisma.$transaction([
    prisma.module.create({
      data: {
        courseId: course.id,
        title: 'Operational Readiness',
        order: 0,
        lessons: {
          create: [
            {
              title: 'Command Structure Overview',
              slug: 'command-structure-overview',
              order: 0,
              summary: 'Roles, responsibilities, and escalation paths.',
              resources: {
                create: [
                  {
                    type: ResourceType.FILE,
                    title: 'Playbook PDF',
                    url: 'https://example.com/playbook.pdf',
                  },
                ],
              },
            },
            {
              title: 'Situational Awareness',
              slug: 'situational-awareness',
              order: 1,
              summary: 'Intel gathering and reporting cadence.',
            },
          ],
        },
      },
    }),
    prisma.module.create({
      data: {
        courseId: course.id,
        title: 'Scenario Drills',
        order: 1,
        lessons: {
          create: [
            {
              title: 'Red Team Simulation',
              slug: 'red-team-simulation',
              order: 0,
              summary: 'Hands-on incident drill walkthrough.',
            },
          ],
        },
      },
    }),
  ])

  console.log(`Seeded ${modules.length} modules for course ${course.title}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
pnpm prisma db seed
```

---

## 2) Authentication & RBAC with Clerk (Day 2–3)

**2.1 Install & configure**
```bash
pnpm add @clerk/nextjs
```
- In Clerk dashboard: add application → retrieve `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Webhooks → user created/updated → `api/webhooks/clerk`.

**2.2 App setup**
- Wrap root layout with `<ClerkProvider/>`.
- Create `/sign-in`, `/sign-up`, `/user` routes using Clerk components.

**2.3 Sync users & roles**
- On user creation webhook: insert/find `User` by `clerkId`, copy email/name/image; set default role `STUDENT`.
- Use the Svix‑verified webhook handler described in **§15.6** to upsert Clerk users into Prisma.

**2.4 Middleware for protected routes**
```ts
// apps/web/src/middleware.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
export function middleware(req: Request) {
  const { userId, sessionClaims } = auth()
  const url = new URL(req.url)
  if (url.pathname.startsWith('/instructor') && sessionClaims?.publicMetadata?.role !== 'INSTRUCTOR') {
    return NextResponse.redirect(new URL('/403', req.url))
  }
  return NextResponse.next()
}
export const config = { matcher: ['/instructor/:path*'] }
```

**2.5 Role management UI (admin‑only)**
- Simple page to promote users to `INSTRUCTOR`.

---

## 3) Storage: Vercel Blob for PDFs/Images (Day 3)

**3.1 Install** `pnpm add @vercel/blob`

**3.2 Client‑direct uploads**
- Create an upload URL route `/api/blob/upload` (server) returning temporary upload URL.
- Use client `fetch` + `FormData` to PUT file → store returned blob url in `Resource`.
- Enforce **immutability** (`addRandomSuffix: true`).

**3.3 Secure downloads**
- Route `/api/download/resource/[id]` checks enrollment → returns signed URL (5 min expiry).

---

## 4) Video: Mux Integration (Day 3–4)

**4.1 Install** `pnpm add @mux/mux-node @mux/mux-player-react`

**4.2 Upload flow**
- Instructor uploads → server action calls Mux **Direct Upload** API → returns `uploadUrl` → client PUTs the file.
- On Mux webhook (asset.ready): write `MuxData { assetId, playbackId, duration }` and link to `Resource`.

**4.3 Secure playback**
- Enable **signed playback** policy → backend issues short‑lived JWT → `<MuxPlayer playbackId={signedId} />`.

---

## 5) Background Jobs: Inngest (Day 4)

**5.1 Install & init**
```bash
pnpm add inngest
```
- Configure Inngest app, connect to Vercel.

**5.2 Events & functions**
- `user.enrolled` → send welcome email (Resend) + in‑app notification.
- `session.approaching` (cron) → `step.sleepUntil` → email 1h before.
- `video.uploaded` → wait for Mux webhook → update lesson resource status.

---

## 6) Instructor Workspace (Day 4–10)

**6.1 Instructor dashboard**
- Route: `/instructor`
- Cards/table: Courses (Draft/Published), enrollments, completion rates.

**6.2 Course builder**
- Routes: `/instructor/courses`, `/instructor/courses/[id]`
- Drag‑and‑drop modules/lessons (order fields), publish toggles, resource manager.
- Rich text editor for lesson content (e.g., TipTap or simple Markdown).

**6.3 Live schedule tool**
- CRUD `CourseSchedule`: start/end UTC, timezone, location, capacity. Validate with Zod.

---

## 7) Student Experience (Day 8–14)

**7.1 Marketplace & discovery**
- Public routes: `/courses`, `/courses/[id]` with instructor card, syllabus, CTA.

**7.2 Enrollment flow**
- Free MVP: click **Enroll** → create `Enrollment` row → redirect to dashboard.
- Paid (later): Stripe Checkout → upon success create `Purchase` and `Enrollment`.

**7.3 Student dashboard**
- `/dashboard` with: **My Courses** (cards + progress bar), **Upcoming Sessions**, **Recent Activity**, **Achievements**.

**7.4 Course consumption**
- Lesson page with sidebar (modules/lessons), Mux Player, PDF viewer, resources list.
- "Mark complete" → Server Action updates `LessonProgress` (optimistic UI).

---

## 8) Calendar Subscription (Day 12–14)

**8.1 ICS route**
- `/api/calendar/[secret].ics` (unguessable per user). Use `ical-generator`.
- Query user’s `StudentScheduleSubscription` → generate events using stored `timezone`.
- Headers: `Content-Type: text/calendar; charset=utf-8` and `Cache-Control: no-store`.

**8.2 UI**
- In **Upcoming Sessions** widget: “Add to Calendar (subscribe)”.

---

## 9) Observability, Analytics, Email (Day 10–15)

**9.1 Env vars (reference)**
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Database
DATABASE_URL=
# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_KEY_PRIVATE=
# Vercel Blob
BLOB_READ_WRITE_TOKEN=
# Inngest
INNGEST_EVENT_KEY=
# Resend
RESEND_API_KEY=
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
# Sentry
SENTRY_AUTH_TOKEN=
SENTRY_DSN=
# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**9.2 Sentry**
- `pnpm add @sentry/nextjs`
- `npx @sentry/wizard -i nextjs`
- Enable tracing + session replay.

**9.3 PostHog**
- `pnpm add posthog-js`
- Init in client layout; track funnels: enrollment & creation.

**9.4 Resend + React Email**
- `pnpm add resend @react-email/components`
- `apps/web/emails/` with templates: Welcome, Enrollment, Session Reminder.
- Send via Inngest functions.

---

## 10) Security & Rate Limiting (Day 12–16)

**10.1 Zod validation**
- All server actions & routes parse/validate input.

**10.2 Security headers**
- Middleware adds CSP, HSTS, X-Frame-Options, X-Content-Type-Options.

**10.3 Rate limit**
- `pnpm add @upstash/ratelimit @upstash/redis`
- Apply to `/api/auth/*`, enrollment, and any heavy routes.

**10.4 Audit log**
- Add `AuditLog` model; log sensitive actions.

---

## 11) Testing Strategy (Day 12–18)

**11.1 Unit/Integration**
- `pnpm add -D vitest @testing-library/react jsdom`
- Test hooks, utils, RBAC guards, server actions (mock Prisma).

**11.2 E2E with Playwright**
- `pnpm dlx playwright@latest install`
- Flows: instructor creates course; student enrolls; completes lesson; calendar subscription link reachable.

**11.3 CI gating**
- GitHub Actions runs lint, typecheck, unit, E2E (on PR).

---

## 12) Deployment & Ops (Day 16–20)

**12.1 Vercel**
- Link project, set env vars per environment.
- Enable cron for daily `session.approaching` precursor emitter.

**12.2 Incident response**
- Sentry alerts → Slack channel `#incidents` (via webhook).
- Post‑mortem template in repo.

**12.3 Status page (nice‑to‑have)**
- Use Instatus or Better Stack.

---

## 13) Post‑Launch Enhancements (6+ weeks)

- **Stripe payments** (Checkout + Customer Portal).
- **Admin console** (user/course moderation, flags).
- **Content versioning** (“Clone Course” flow).
- **Mobile‑ready API layer** (stable `/api/v1/*` routes).
- **Community** (per‑course threads, moderation tools).

---

## 14) Tickets Backlog (copy/paste to Issues)

**Epic: Core Data & Auth**
1. Add Prisma schema & run migrations.
2. Implement Clerk auth, layouts, sign‑in/up.
3. Webhook to sync Clerk → Prisma User.
4. Role middleware & admin role page.

**Epic: Instructor Studio**
5. Instructor dashboard shell.
6. Course CRUD + publish toggle.
7. Module & lesson DnD ordering.
8. Resource manager (Blob + Mux upload).
9. Live schedule CRUD with Zod validation.

**Epic: Student Experience**
10. Courses listing & detail page.
11. Enrollment server action.
12. Student dashboard with progress bars.
13. Lesson viewer with Mux & PDF.
14. Mark lesson complete (optimistic UI).
15. ICS subscription route & UI.

**Epic: Jobs & Notifications**
16. Inngest app setup.
17. `user.enrolled` → welcome email (Resend).
18. Daily cron → `session.approaching` events.
19. Reminder 24h/1h before session.

**Epic: Quality, Security, Analytics**
20. Sentry setup (errors, tracing, replay).
21. PostHog events (funnels, retention cohorts).
22. Upstash rate limiting middleware.
23. Security headers + CSP.
24. Unit & E2E test suites + CI gate.

---

## 15) Example Code Snippets

**15.1 Server Action (enroll)**
```ts
'use server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
const Input = z.object({ courseId: z.string().cuid() })
export async function enrollAction(formData: FormData) {
  const { userId } = auth()
  if (!userId) throw new Error('Unauthorized')
  const { courseId } = Input.parse({ courseId: formData.get('courseId') })
  await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  })
  // revalidatePath('/dashboard')
}
```

**15.2 Secure resource download**
```ts
// app/api/download/resource/[id]/route.ts
import { NextResponse } from 'next/server'
import { getSignedURL } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
export async function GET(_: Request, { params }: { params: { id: string }}) {
  const { userId } = auth(); if (!userId) return NextResponse.json({ error:'unauth' }, { status: 401 })
  const resource = await db.resource.findUnique({ where: { id: params.id }, include: { lesson: { include: { module: { include: { course: true } } } } } })
  const isEnrolled = await db.enrollment.findFirst({ where: { userId, courseId: resource!.lesson.module.courseId } })
  if (!isEnrolled) return NextResponse.json({ error:'forbidden' }, { status: 403 })
  const url = await getSignedURL({ url: resource!.url!, expiresIn: 60 * 5 })
  return NextResponse.redirect(url)
}
```

**15.3 ICS feed**
```ts
// app/api/calendar/[secret]/route.ts
import ical from 'ical-generator'
export async function GET(_: Request, { params }: { params: { secret: string } }) {
  const user = await db.user.findFirst({ where: { calendarSecret: params.secret } })
  if (!user) return new Response('Not found', { status: 404 })
  const subs = await db.studentScheduleSubscription.findMany({ where: { userId: user.id }, include: { schedule: true } })
  const cal = ical({ name: 'Actium Schedule' })
  subs.forEach(({ schedule }) => {
    cal.createEvent({
      start: schedule.startTime,
      end: schedule.endTime,
      summary: 'Actium Training Session',
      location: schedule.location,
      timezone: schedule.timezone,
    })
  })
  return new Response(cal.toString(), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' } })
}
```

**15.4 Upstash rate limit**
```ts
// middleware.ts excerpt
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(20, '10 s') })
export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(`rl:${ip}:${new URL(req.url).pathname}`)
  if (!success) return new Response('Too many requests', { status: 429 })
  return NextResponse.next()
}
```

**15.5 Sentry init**
```ts
// sentry.client.config.ts & sentry.server.config.ts auto-generated by wizard
import * as Sentry from '@sentry/nextjs'
Sentry.init({ dsn: process.env.SENTRY_DSN!, tracesSampleRate: 0.2, replaysSessionSampleRate: 0.1 })
```

**15.6 Clerk webhook handler**
```ts
// apps/web/src/app/api/webhooks/clerk/route.ts
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const payload = await req.text()
  const headerPayload = {
    'svix-id': headers().get('svix-id') ?? '',
    'svix-timestamp': headers().get('svix-timestamp') ?? '',
    'svix-signature': headers().get('svix-signature') ?? '',
  }

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: any
  try {
    event = webhook.verify(payload, headerPayload)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const data = event.data
  if (event.type === 'user.created' || event.type === 'user.updated') {
    await db.user.upsert({
      where: { clerkId: data.id },
      update: {
        email: data.email_addresses?.[0]?.email_address ?? data.primary_email_address_id,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || data.id,
        imageUrl: data.image_url,
        role: data.public_metadata?.role ?? 'STUDENT',
      },
      create: {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? `${data.id}@example.com`,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || data.id,
        imageUrl: data.image_url,
        role: data.public_metadata?.role ?? 'STUDENT',
      },
    })
  }

  return NextResponse.json({ received: true })
}
```

**15.7 Blob upload URL route**
```ts
// apps/web/src/app/api/blob/upload/route.ts
import { createUploadUrl } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, filename } = await req.json()
  const url = await createUploadUrl({
    expiresIn: 60 * 5,
    allowedContentTypes: [contentType],
    addRandomSuffix: true,
    metadata: { userId, filename },
  })

  return NextResponse.json({ uploadUrl: url })
}
```

**15.8 Mux direct upload server action**
```ts
// apps/web/src/app/api/mux/direct-upload/route.ts
import Mux from '@mux/mux-node'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(req: Request) {
  const { userId, sessionClaims } = auth()
  if (!userId || sessionClaims?.publicMetadata?.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { lessonId } = await req.json()
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL,
    new_asset_settings: {
      playback_policy: ['signed'],
      passthrough: lessonId,
    },
  })

  return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id })
}
```

**15.9 Inngest function for enrollment**
```ts
// apps/web/src/inngest/functions/user-enrolled.ts
import { inngest } from '@/lib/inngest'
import { resend } from '@/lib/resend'
import { db } from '@/lib/db'
import WelcomeEmail from '@/emails/welcome-email'

export const userEnrolled = inngest.createFunction(
  { id: 'user.enrolled' },
  { event: 'user/enrolled' },
  async ({ event }) => {
    const enrollment = await db.enrollment.findUnique({
      where: { id: event.data.enrollmentId },
      include: { user: true, course: true },
    })
    if (!enrollment) return

    await resend.emails.send({
      from: 'Actium <welcome@actium.dev>',
      to: enrollment.user.email,
      subject: `Welcome to ${enrollment.course.title}`,
      react: (
        <WelcomeEmail
          userName={enrollment.user.fullName}
          courseTitle={enrollment.course.title}
        />
      ),
    })

    return { delivered: true }
  }
)
```

**15.10 Security headers middleware**
```ts
// apps/web/src/middleware.ts (security section)
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const response = NextResponse.next()
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.clerk.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://images.clerk.dev data:",
      "media-src 'self' https://stream.mux.com",
      "frame-src 'self' https://*.mux.com https://*.clerk.com",
      "connect-src 'self' https://api.clerk.dev https://*.mux.com https://*.posthog.com",
    ].join('; ')
  )
  return response
}
```

**15.11 GitHub Actions CI workflow**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint test typecheck
      - run: pnpm turbo run e2e --filter=apps/web -- --reporter=list
```

---

## 16) Milestones & Timeline (30/60/90)

**Days 1–30 (M1)**: Auth + schema + Instructor Studio + uploads (Blob/Mux) → seed first course.

**Days 31–60 (M2)**: Marketplace + Student dashboard + Course viewer + Progress + Calendar.

**Days 61–90 (M3)**: PostHog analytics, email notifications via Inngest/Resend, forums v1, Sentry hardening, tests/CI.

---

## 17) Done‑When Checklist (Go/No‑Go)

- [ ] Instructors can create/publish a course with at least 3 modules & 10 lessons.
- [ ] Students can enroll, watch Mux videos (signed), view PDFs, track progress.
- [ ] ICS subscription works across Google/Apple/Outlook.
- [ ] Sentry shows no uncaught errors during happy paths.
- [ ] PostHog funnels show activation steps firing.
- [ ] E2E tests pass in CI; main is protected.

---

## 18) Risks & Mitigations (Quick)

- **Vendor lock‑in** (Clerk/Mux/Inngest): Accept for speed; design migration seams (webhooks, adapters).
- **PII leakage**: Strict secrets, CSP, signed URLs, audit logs, Sentry PII scrubbing.
- **Video costs**: Encode/stream analytics monitoring; cap uploads; compress guidance.

---

## 19) Appendix: Developer Quality of Life

- **Scripts** in `package.json`: `dev`, `build`, `typecheck`, `lint`, `test`, `e2e`, `db:migrate`, `db:studio`.
- **DX**: Prettier, ESLint strict, `@total-typescript/ts-reset`, Git hooks with `lefthook`.
- **Docs**: `/docs/` with ADRs and incident template.
