import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/download-file",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("storageId");
    const fileName = url.searchParams.get("fileName") || "download.csv";
    
    if (!storageId) {
      return new Response("Storage ID is required", { status: 400 });
    }
    
    try {
      const file = await ctx.storage.get(storageId as Id<"_storage">);
      
      if (!file) {
        return new Response("File not found", { status: 404 });
      }
      
      return new Response(file, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type"
        },
      });
    } catch (error) {
      console.error("File download error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;