import { serve } from "inngest/next";
import { inngest } from "@/src/inngest/client";
import { generate } from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generate,
  ],
});