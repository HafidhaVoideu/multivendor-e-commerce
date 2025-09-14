"use server";
export async function createStoreAction(formData, token) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/store/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return resp.json();
}
