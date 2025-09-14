//! check if user is a seller
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const storeInfo = await prisma.store.findUnique({
      where: { userId },
    });

    return NextResponse.json({ storeInfo, isSeller });
  } catch (error) {
    console.log("error in isSeller", error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
