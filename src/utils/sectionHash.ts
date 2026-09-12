/**
 * Section ids double as the visible nav labels ("Work"), so they stay
 * capitalised. URLs should not - hugoogb.dev/#work reads better than /#Work -
 * so the two are mapped rather than kept identical.
 */
export const hashOf = (sectionId: string) => `#${sectionId.toLowerCase()}`;

export const sectionIdFromHash = (
  hash: string,
  sectionIds: readonly string[],
): string | undefined => {
  const wanted = hash.replace(/^#/, "").toLowerCase();
  if (!wanted) return undefined;
  return sectionIds.find((id) => id.toLowerCase() === wanted);
};
