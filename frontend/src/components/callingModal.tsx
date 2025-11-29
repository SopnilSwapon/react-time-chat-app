import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

export default function CallingModal() {
  const { isCalling, receiverId, cancelCall } = useCallStore((s) => s);
  const { users } = useChatStore((s) => s);

  if (!isCalling) return null;

  const receiver = users?.find((u) => u._id === receiverId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl text-center w-80 shadow-xl">
        <h2 className="text-lg text-black font-semibold">
          Calling {receiver?.fullName || "User"}...
        </h2>

        <div className="mt-3 text-black animate-pulse">Ringing...</div>

        <button className="btn btn-error mt-5 w-full" onClick={cancelCall}>
          Cancel Call
        </button>
      </div>
    </div>
  );
}
