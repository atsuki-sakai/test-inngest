"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Replace this with your actual Convex URL from your deployment
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export { convex, ConvexProvider };