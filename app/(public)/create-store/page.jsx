"use client";
import { assets } from "@/assets/assets";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { useUser } from "@clerk/nextjs";
import { createStoreAction } from "@/app/actions/actions";
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

export default function CreateStore() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    image: "",
  });

  const onChangeHandler = (e) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  };

  const fetchSellerStatus = async () => {
    try {
      const token = await getToken({ template: "default" });
      const resp = await fetch("api/store/create", {
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await resp.json();

      console.log("status response:", data);
      if (["approved", "pending", "rejected"].includes(data.status)) {
        setAlreadySubmitted(true);
        setStatus(data.status);

        switch (data.status) {
          case "approved":
            {
              setMessage(
                "Your store has been approved. You can now add products from your dashboard."
              );

              setTimeout(() => router.push("/store"), 5000);
            }

            break;

          case "pending":
            {
              setMessage(
                "Your store is pending. Please wait for the admin to aprrove your store."
              );
            }

            break;

          case "rejected":
            {
              setMessage(
                "Your store request has been rejected. Please contact the admin for more details"
              );
            }

            break;

          default:
            break;
        }
      } else {
        setAlreadySubmitted(false);
      }
    } catch (error) {
      console.log("error in submit store", error);
      toast.error(
        "Error in creating store" ||
          error.message ||
          error?.response?.data?.error
      );
    }

    setLoading(false);
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      if (!user) {
        return toast("please login to continue");
      }
      const token = await getToken({ template: "default" });

      const formDATA = new FormData();
      formDATA.append("username", storeInfo.username);
      formDATA.append("name", storeInfo.name);
      formDATA.append("description", storeInfo.description);
      formDATA.append("email", storeInfo.email);
      formDATA.append("contact", storeInfo.contact);
      formDATA.append("address", storeInfo.address);
      formDATA.append("image", storeInfo.image);

      startTransition(async () => {
        try {
          const response = await createStoreAction(formDATA, token);
          if (!response.success) {
            throw new Error(response.error || "Request failed");
          }
          console.log("data after store creation:", response);
          await fetchSellerStatus();
        } catch (e) {
          toast.error(e.message);
        }
      });
    } catch (error) {
      console.log("error in submit store", error);
      toast.error(error.message || error?.response?.data?.error);
    }

    // Logic to submit the store details
  };

  useEffect(() => {
    if (user) {
      fetchSellerStatus();
    }
  }, [user]);

  if (!user)
    return (
      <div className="min-h-[80vh] mx-6 flex justify-center items-center text-slate-400">
        <h1 className=" text-2xl sm:text-4xl font-semibold">
          {" "}
          Please
          <span className="text-slate-500"> Login </span>
          to continue
        </h1>
      </div>
    );

  return !loading ? (
    <>
      {!alreadySubmitted ? (
        <div className="mx-6 min-h-[70vh] my-16">
          <form
            onSubmit={(e) =>
              toast.promise(onSubmitHandler(e), {
                loading: "Submitting data...",
              })
            }
            className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl ">
                Add Your{" "}
                <span className="text-slate-800 font-medium">Store</span>
              </h1>
              <p className="max-w-lg">
                To become a seller on GoCart, submit your store details for
                review. Your store will be activated after admin verification.
              </p>
            </div>

            <label className="mt-10 cursor-pointer">
              Store Logo
              <Image
                src={
                  storeInfo.image
                    ? URL.createObjectURL(storeInfo.image)
                    : assets.upload_area
                }
                className="rounded-lg mt-2 h-16 w-auto"
                alt=""
                width={150}
                height={100}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                }
                hidden
              />
            </label>

            <p>Username</p>
            <input
              name="username"
              onChange={onChangeHandler}
              value={storeInfo.username}
              type="text"
              placeholder="Enter your store username"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Name</p>
            <input
              name="name"
              onChange={onChangeHandler}
              value={storeInfo.name}
              type="text"
              placeholder="Enter your store name"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Description</p>
            <textarea
              name="description"
              onChange={onChangeHandler}
              value={storeInfo.description}
              rows={5}
              placeholder="Enter your store description"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none"
            />

            <p>Email</p>
            <input
              name="email"
              onChange={onChangeHandler}
              value={storeInfo.email}
              type="email"
              placeholder="Enter your store email"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Contact Number</p>
            <input
              name="contact"
              onChange={onChangeHandler}
              value={storeInfo.contact}
              type="text"
              placeholder="Enter your store contact number"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Address</p>
            <textarea
              name="address"
              onChange={onChangeHandler}
              value={storeInfo.address}
              rows={5}
              placeholder="Enter your store address"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none"
            />

            <button
              disabled={isPending}
              className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition "
            >
              {isPending ? "Creating..." : "Create Store"}
            </button>
          </form>
        </div>
      ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">
            {message}
          </p>
          {status === "approved" && (
            <p className="mt-5 text-slate-400">
              redirecting to dashboard in{" "}
              <span className="font-semibold">5 seconds</span>
            </p>
          )}
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
}
