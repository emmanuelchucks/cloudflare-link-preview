import * as v from "valibot";

export const linkPreviewSchema = v.object({
  description: v.optional(v.string()),
  domain: v.string(),
  favicon: v.optional(v.string()),
  image: v.optional(v.string()),
  title: v.optional(v.string()),
});

export type LinkPreview = v.InferOutput<typeof linkPreviewSchema>;
