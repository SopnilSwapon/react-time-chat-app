/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "zustand";

export type TCallState = {
  isCalling: boolean;
  incomingCall: boolean;
  inCall: boolean;
  callerId: string | null;
  receiverId: string | null;
  peerConnection: RTCPeerConnection | null;

  startCall: (receiverId: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  receiveCall: (from: string) => void;
  cancelCall: () => void;

  setPeerConnection: (pc: RTCPeerConnection | null) => void;
  setIncomingCall: (v: boolean) => void;
  setCalling: (v: boolean) => void;
  setInCall: (v: boolean) => void;
  setCallerId: (id: string | null) => void;
  setReceiverId: (id: string | null) => void;

  stopCallerRingtone: () => void;
};

export const callStore = createStore<TCallState>((set, get) => {
  const incomingTone = new Audio("/liyakun.mp3");
  const outgoingTone = new Audio("/vip.mp3");

  incomingTone.loop = true;
  outgoingTone.loop = true;

  let timeoutHandler: any = null;

  const stopAll = () => {
    incomingTone.pause();
    incomingTone.currentTime = 0;

    outgoingTone.pause();
    outgoingTone.currentTime = 0;
  };

  return {
    isCalling: false,
    incomingCall: false,
    inCall: false,
    callerId: null,
    receiverId: null,
    peerConnection: null,

    stopCallerRingtone: () => {
      outgoingTone.pause();
      outgoingTone.currentTime = 0;
    },

    setPeerConnection: (pc) => set({ peerConnection: pc }),
    setIncomingCall: (v) => set({ incomingCall: v }),
    setCalling: (v) => set({ isCalling: v }),
    setInCall: (v) => set({ inCall: v }),
    setCallerId: (id) => set({ callerId: id }),
    setReceiverId: (id) => set({ receiverId: id }),

    // Start call
    startCall: async (receiverId) => {
      const socket = (window as any).mainSocket;

      outgoingTone.play().catch(() => {});

      set({ isCalling: true, receiverId });

      const pc = new RTCPeerConnection({
        iceTransportPolicy: "relay",
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3478",
            username: "efhJ8xD7v33gLrI",
            credential: "3LoD6ERk7LkqjF5p",
          },
        ],
      });

      (pc as any)._queuedCandidates = [];

      set({ peerConnection: pc });

      // ✔ get mic before creating offer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        const audio = document.getElementById(
          "remoteAudio"
        ) as HTMLAudioElement;
        if (audio) {
          audio.srcObject = e.streams[0];
          audio.play().catch(() => {});
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: receiverId,
            candidate: e.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", { to: receiverId, offer });

      timeoutHandler = setTimeout(() => {
        if (!get().inCall) get().cancelCall();
      }, 30000);
    },

    // Accept call
    acceptCall: async () => {
      const { callerId, peerConnection } = get();
      const socket = (window as any).mainSocket;

      stopAll();
      if (timeoutHandler) clearTimeout(timeoutHandler);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      stream.getTracks().forEach((t) => peerConnection?.addTrack(t, stream));

      const answer = await peerConnection?.createAnswer();
      await peerConnection?.setLocalDescription(answer);

      socket.emit("answer-call", { to: callerId, answer });

      set({ incomingCall: false, inCall: true });
    },

    // Receipt call (show a modal)
    receiveCall: (from) => {
      set({ incomingCall: true, callerId: from });

      incomingTone.play().catch(() => {});

      timeoutHandler = setTimeout(() => {
        if (!get().inCall) get().rejectCall();
      }, 30000);
    },

    //Cancel call (caller)
    cancelCall: () => {
      const socket = (window as any).mainSocket;
      const { receiverId, peerConnection } = get();

      stopAll();
      if (timeoutHandler) clearTimeout(timeoutHandler);

      peerConnection?.close();
      socket.emit("end-call", { to: receiverId });

      set({
        isCalling: false,
        incomingCall: false,
        inCall: false,
        callerId: null,
        receiverId: null,
        peerConnection: null,
      });
    },

    // Reject call (Receiver)
    rejectCall: () => {
      const socket = (window as any).mainSocket;
      const { callerId } = get();

      stopAll();
      if (timeoutHandler) clearTimeout(timeoutHandler);

      socket.emit("end-call", { to: callerId });

      set({ incomingCall: false, callerId: null });
    },

    // End call
    endCall: () => {
      const socket = (window as any).mainSocket;
      const { callerId, receiverId, peerConnection } = get();

      stopAll();
      if (timeoutHandler) clearTimeout(timeoutHandler);

      peerConnection?.close();
      socket.emit("end-call", { to: callerId || receiverId });

      set({
        isCalling: false,
        incomingCall: false,
        inCall: false,
        callerId: null,
        receiverId: null,
        peerConnection: null,
      });
    },
  };
});
