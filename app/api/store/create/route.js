import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import imagekit from "@/configs/imageKit";

import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    console.log("userid in router:", userId);
    const formData = await request.formData();
    const username = formData.get("username");
    const email = formData.get("email");
    const name = formData.get("name");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const description = formData.get("description");
    const image = formData.get("image");

    if (
      !username ||
      !email ||
      !name ||
      !contact ||
      !address ||
      !description ||
      !image
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });

    if (store) {
      return NextResponse.json({ success: true, status: store.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (isUsernameTaken) {
      return NextResponse.json(
        { success: false, error: "Username is already taken" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const logoURLResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: logoURLResponse.filePath,
      transformation: [
        {
          format: "webp",
          quality: "auto",
          width: "512",
        },
      ],
    });

    const createStore = await prisma.store.create({
      data: {
        userId,
        username: username.toLowerCase(),
        email: email,
        name: name,
        contact: contact,
        address: address,
        description: description,
        logo: optimizedImage,
      },

      // connect user to a store
    });

    await prisma.user.update({
      where: { userId },
      data: { store: { connect: { id: createStore.id } } },
    });

    return NextResponse.json({
      message: "Store created successfully! Wait for admin approval.",
    });
  } catch (error) {
    console.log("error in create store", error);

    return NextResponse.json(
      { success: false, error: error.code || error.message },
      { status: 400 }
    );
  }
}

// ! get the status of a store

export async function GET(request) {
  const { userId } = getAuth(request);

  try {
    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (store) {
      return NextResponse.json({ success: true, status: store.status });
    }

    return NextResponse.json({ status: "not registered" });
  } catch (error) {
    console.log("error in get store status");
    return NextResponse.json(
      { success: false, error: error.code || error.message },
      { status: 400 }
    );
  }
}
