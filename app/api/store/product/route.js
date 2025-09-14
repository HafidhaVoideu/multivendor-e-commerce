import prisma from "@/lib/prisma";
import { authSeller } from "@/middleware/authSeller";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const storeId = authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formdata = await request.formData();
    const name = formdata.get("name");
    const description = formdata.get("description");
    const price = formdata.get("price");
    const images = formdata.getAll("images");
    const mrp = formdata.get("mrp");
    const category = formdata.get("category");

    if (
      !name ||
      !description ||
      !price ||
      !images.length ||
      !mrp ||
      !category
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const imagesUpload = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const imageResponse = imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        const optimizedImage = imagekit.url({
          path: imageResponse.filePath,
          transformation: [
            {
              format: "webp",
              quality: "auto",
              width: "1024",
            },
          ],
        });

        return optimizedImage;
      })
    );

    prisma.product.create({
      data: {
        name,
        description,
        price,
        images: imagesUpload,
        mrp,
        category,
        storeId,
      },
    });

    return NextResponse.json({ message: "Product created successfully" });
  } catch (error) {
    console.log("error in create product", error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

//! get all products

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const storeId = authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const products = await prisma.product.findMany({
      where: { storeId },
    });

    return NextResponse.json({ products });
  } catch (e) {
    console.log("error in get products", e);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
