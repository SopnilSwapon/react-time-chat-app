/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export type TCallState = {
  isCalling: boolean;
  incomingCall: boolean;
  callerId: string | null;
  peerConnection: RTCPeerConnection | null;

  startCall: (receiverId: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  setPeerConnection: (data: any) => void;
  setIncomingCall: (data: any) => void;
  setCallerId: (data: any) => void;
};

export const callStore = create<TCallState>((set, get) => ({
  isCalling: false,
  incomingCall: false,
  callerId: null,
  peerConnection: null,

  setPeerConnection: (pc: any) => set({ peerConnection: pc }),
  setIncomingCall: (value: any) => set({ incomingCall: value }),
  setCallerId: (id: any) => set({ callerId: id }),

  startCall: async (receiverId) => {
    const socket = (window as any).mainSocket;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    set({ peerConnection: pc, isCalling: true });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: receiverId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const audio = document.getElementById("remoteAudio") as HTMLAudioElement;
      audio.srcObject = event.streams[0];
      audio.play();
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", { to: receiverId, offer });
  },

  acceptCall: async () => {
    const { callerId, peerConnection } = get();
    const socket = (window as any).mainSocket;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((t) => peerConnection?.addTrack(t, stream));

    const answer = await peerConnection?.createAnswer();
    await peerConnection?.setLocalDescription(answer);

    socket.emit("answer-call", { to: callerId, answer });

    set({ incomingCall: false, isCalling: true });
  },

  rejectCall: () => {
    const socket = (window as any).mainSocket;
    const { callerId } = get();

    socket.emit("end-call", { to: callerId });

    set({ incomingCall: false, callerId: null });
  },

  endCall: () => {
    const socket = (window as any).mainSocket;
    const { callerId, peerConnection } = get();

    peerConnection?.close();

    socket.emit("end-call", { to: callerId });

    set({
      isCalling: false,
      incomingCall: false,
      callerId: null,
      peerConnection: null,
    });
  },
}));
