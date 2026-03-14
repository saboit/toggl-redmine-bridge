# @saboit/toggl-redmine-bridge

A TypeScript library that provides fully typed clients and React Query hooks for both the **Toggl v9** and **Redmine** APIs. Uses native `fetch` — no axios required.

## What's included

| Export | Description |
|---|---|
| `@saboit/toggl-redmine-bridge` | `initConfig`, raw SDK clients |
| `@saboit/toggl-redmine-bridge/api-toggl` | Toggl SDK functions (plain async fetch) |
| `@saboit/toggl-redmine-bridge/api-redmine` | Redmine SDK functions (plain async fetch) |
| `@saboit/toggl-redmine-bridge/api-toggl-hooks` | Toggl React Query hooks |
| `@saboit/toggl-redmine-bridge/api-redmine-hooks` | Redmine React Query hooks |

## Installation

```bash
npm install @saboit/toggl-redmine-bridge @tanstack/react-query
```

The package is published to GitHub Packages. Add the following to your `.npmrc`:

```
@saboit:registry=https://npm.pkg.github.com/
```

## Setup

Call `initConfig` once at app startup (before any hooks or SDK calls). It configures both the raw SDK clients and the React Query hook fetch instances.

```ts
import { initConfig } from '@saboit/toggl-redmine-bridge';

initConfig({
  redmine: {
    baseUrl: 'https://redmine.example.com',
    token: 'Basic <base64(login:password)>',
  },
  toggl: {
    baseUrl: 'https://api.track.toggl.com',
    token: 'Basic <base64(email:api_token)>',
  },
});
```

Wrap your app with a `QueryClientProvider` as required by React Query:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Usage

### React Query hooks

```tsx
import { useCreateTimeEntry } from '@saboit/toggl-redmine-bridge/api-redmine-hooks';
import { usePostWorkspaceTimeEntries } from '@saboit/toggl-redmine-bridge/api-toggl-hooks';

function TimeTracker() {
  // Create a Redmine time entry
  const { mutate: logRedmineTime } = useCreateTimeEntry();

  // Create a Toggl time entry
  const { mutate: logTogglTime } = usePostWorkspaceTimeEntries();

  const handleLog = () => {
    logRedmineTime({
      data: { time_entry: { issue_id: 42, hours: 2, activity_id: 1 } },
      format: 'json',
    });

    logTogglTime({
      workspaceId: 12345,
      data: { description: 'Working on issue #42', duration: 7200 },
    });
  };

  return <button onClick={handleLog}>Log Time</button>;
}
```

### Raw SDK clients

The SDK functions are plain async wrappers around fetch — useful outside of React or when you need more control.

```ts
import { createTimeEntry } from '@saboit/toggl-redmine-bridge/api-redmine';
import { postWorkspaceTimeEntries } from '@saboit/toggl-redmine-bridge/api-toggl';

const entry = await createTimeEntry({
  format: 'json',
  body: { time_entry: { issue_id: 42, hours: 2, activity_id: 1 } },
});
```

## Regenerating API clients

The clients and hooks are generated from OpenAPI specs. To regenerate after updating the spec files:

```bash
# Regenerate raw SDK clients
npm run generate-redmine
npm run generate-toggl

# Regenerate React Query hooks
npm run generate-hooks          # both
npm run generate-redmine-hooks  # Redmine only
npm run generate-toggl-hooks    # Toggl only
```

The Toggl spec (`toggl-api-v9.json`) is vendored locally. The Redmine spec (`redmine-api.json`) is also local.

## Building

```bash
npm run build
```

Output goes to `dist/`.
