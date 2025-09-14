import { inngest } from "./client";
import prisma from "@/lib/prisma";

console.log("the file is loaded");

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("Received user.created event:", event.data);

    const data = event.data;

    try {
      await prisma.user.upsert({
        where: { id: data.id },
        update: {}, // do nothing if exists
        create: {
          id: data.id,
          email: data.email_addresses[0]?.emailAddress ?? "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url ?? "",
        },
      });
      console.log("User inserted into Neon:", data.id);
    } catch (err) {
      console.error("Failed to insert user into Neon:", err);
    }
  }
);

export const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        id: data.id,
        email: data.email_addresses[0],
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });

    return;
  }
);
export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });

    return;
  }
);
