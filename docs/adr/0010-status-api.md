# 0010: Status API

### Status probes use HEAD with a GET fallback

Where: `api/status.ts` `probe`

The status probe asks with HEAD because the question is whether the host answers, not how heavy its page is. A host that refuses HEAD (405, 501 or a hang-up) is asked again with GET, and each attempt is timed alone so a fallback never reports the failed attempt's time too.

### Service status is probed from the server

Where: `api/status.ts` `handler`

The service panel reads status from this edge function because the browser cannot: the F1 API's preflight returns 400 for every origin. A server-side request has no Origin to reject and no preflight, and the response is cached at the edge (s-maxage 300) so upstream hosts see about one probe every five minutes regardless of traffic.
