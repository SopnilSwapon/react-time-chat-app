import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

export default function ActiveCallModal() {
  const { inCall, callerId, receiverId, endCall } = useCallStore((s) => s);
  const { users } = useChatStore((s) => s);

  if (!inCall) return null;

  const partnerId = callerId || receiverId;
  const partner = users?.find((u) => u._id === partnerId);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 text-center shadow-xl">
        <h2 className="text-xl text-black font-semibold">
          In Call with {partner?.fullName}
        </h2>

        <p className="mt-3 text-black">Connected</p>

        <button className="btn btn-error w-full mt-6" onClick={endCall}>
          End Call
        </button>
      </div>
    </div>
  );
}
