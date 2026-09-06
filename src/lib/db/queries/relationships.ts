import { db } from "@/lib/db/client";
import { contentRelationships } from "@/lib/db/schema";

// PRD §43 — lightweight infra today (EXPANDED_FROM for Brain→Journal),
// generic enough to hold RELATED_TO/REFERENCES once semantic linking exists.
export async function createRelationship(input: {
  sourceType: (typeof contentRelationships.$inferInsert)["sourceType"];
  sourceId: string;
  targetType: (typeof contentRelationships.$inferInsert)["targetType"];
  targetId: string;
  relationshipType: (typeof contentRelationships.$inferInsert)["relationshipType"];
}) {
  await db.insert(contentRelationships).values(input);
}
