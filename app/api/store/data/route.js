import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    const searchParams = new URL(request.url);
    const username = searchParams.get("username").toLowerCase();

    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: {
        username,
        isActive: true,
      },

      include: { product: { include: { rating: true } } },
    });

    if (!store) {
      return new Response("Store not found", { status: 404 });
    }

    return NextResponse.json({ store }, { status: 200 });
  } catch (e) {
    console.log("error in get store", e);
    return NextResponse.json({ error: e.code || e.message }, { status: 400 });
  }
}
