import { authSeller } from "@/middleware/authSeller";
import { getAuth } from "@clerk/next/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

//!  GET THE TOTAL NUMBER OF PRODUCTS, ORDERS, RATINGS, AND TOTAL EARNINGS

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // products
    const products = await prisma.product.findMany({
      where: { storeId },
    });

    // orders
    const orders = await prisma.order.findMany({
      where: { storeId },
    });

    // ratings

    const ratings = await prisma.rating.findMany({
      productId: { in: products.map((product) => product.id) },
      include: { product: true, user: true },
    });

    const dashboardStats = {
      totalProducts: products.length,
      totalOrders: orders.length,
      ratings: ratings,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + order.total, 0)
      ),
    };

    return NextResponse.json(dashboardStats, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
