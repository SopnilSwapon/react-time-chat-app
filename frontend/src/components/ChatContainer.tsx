import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";

export default function ChatContainer() {
  const { messages, isMessagesLoading, getMessages, selectedUser } =
    useChatStore((state) => state);
  useEffect(() => {
    getMessages(selectedUser!._id);
  }, [selectedUser, getMessages]);
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {isMessagesLoading ? <MessageSkeleton /> : <div>Data coming soon</div>}

      <MessageInput />
    </div>
  );
}
