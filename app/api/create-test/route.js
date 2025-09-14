// app/api/test-user/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await prisma.user.create({
    data: {
      id: "test123",
      email: "test@example.com",
      name: "Test User",
      image: "",
    },
  });

  return NextResponse.json(user);
}
