import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextRequest, NextResponse } from "next/server";
import imagekit from "./../../../../../configs/imageKit";
import prisma from "./../../../../../lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
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
      return NextRequest.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });

    if (store) {
      return NextRequest.json({ status: store.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLoawerCase() },
    });

    if (isUsernameTaken) {
      return NextRequest.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const buffer = Buffer.fron(await image.arrayBuffer());

    const logoURLResponse = imagekit.upload({
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
      where: { userId: userId },
      data: {
        username: username.toLoawerCase,
        email: email,
        name: name,
        contact: contact,
        address: address,
        description: description,
        image: optimizedImage,
      },

      // connect user to a store
    });

    await prisma.user.update({
      where: { userId: userId },
      data: { store: { connect: { id: createStore.id } } },
    });

    return NextRequest.json({
      message: "Store created successfully.Waiting for approval...",
    });
  } catch (error) {
    console.log("error in create store");

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// ! get the status of a store

export async function GET(request) {
  const { userId } = getAuth(request);

  try {
    const store = await prisma.store.findFirst({
      where: { userId: userId },
    });

    if (store) {
      return NextRequest.json({ status: store.status });
    }

    return NextRequest.json({ status: "not registered" });
  } catch (error) {
    console.log("error in get store status");
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
