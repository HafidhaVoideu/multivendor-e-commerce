import prisma from "@/lib/prisma";

export async function authSeller(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: { store: true },
    });

    if (user.store) {
      if (user.store.status == "approved") {
        return user.store.id;
      }
    } else {
      return false;
    }
  } catch (e) {
    console.log("error in authSeller", e);
    return false;
  }
}
