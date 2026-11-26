# 0008: Content and SEO

### Project copy comes from projects.constants.ts

Where: `src/content/places.ts` project places; `src/constants/projects.constants.ts`

Place project copy, links and screenshots are read from projects.constants.ts, the one place they are already kept accurate. The town's own content adds only where and how a place is shown.

### Hosting data is types-only and shared with the status API

Where: `src/content/services.ts` `SERVICES`; `api/status.ts`

The services file imports types only because api/status.ts imports it and must not pull in places.ts and its image imports. The yard's racks and traffic derive from this one list, so a project moving host is a one-line change.

### The site itself is not status-probed

Where: `src/content/services.ts`

This site is never probed for status. If it were down nobody would be reading the answer.

### Screenshot descriptions describe the picture

Where: `src/types/project.types.ts` screenshot description field

The screenshot description says what the image shows, not what the project is, because search engines read it as the image's description.

### Structured data is generated and avoids rich-result types

Where: `src/utils/structuredData.ts` `structuredData`

The JSON-LD is built from the same constants the page renders, so it cannot drift from what visitors see. Projects use SoftwareSourceCode when the code is public and CreativeWork when not, because neither is a Google rich-result type and so neither triggers missing-field warnings in Search Console.
