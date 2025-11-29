/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { createStore } from "zustand";

// export type TCallState = {
//   isCalling: boolean;
//   incomingCall: boolean;
//   inCall: boolean;
//   callerId: string | null;
//   receiverId: string | null;
//   peerConnection: RTCPeerConnection | null;

//   startCall: (receiverId: string) => void;
//   acceptCall: () => void;
//   rejectCall: () => void;
//   endCall: () => void;
//   receiveCall: (from: string) => void;
//   cancelCall: () => void;
//   setPeerConnection: (data: any) => void;
//   setIncomingCall: (data: any) => void;
//   setCallerId: (data: any) => void;
//   setCalling: (data: any) => void;
//   setInCall: (data: any) => void;
//   setReceiverId: (data: any) => void;
//   stopCallerRingtone: () => void;
// };

// export const callStore = createStore<TCallState>((set, get) => {
//   // -------------------------
//   // RINGTONES
//   // -------------------------
//   const incomingTone = new Audio("/liyakun.mp3");
//   const outgoingTone = new Audio("/vip.mp3");

//   incomingTone.loop = true;
//   outgoingTone.loop = true;

//   let timeoutHandler: ReturnType<typeof setTimeout> | null = null;

//   const stopAllRingtones = () => {
//     incomingTone.pause();
//     incomingTone.currentTime = 0;

//     outgoingTone.pause();
//     outgoingTone.currentTime = 0;
//   };
//   const stopCallerRingtone = () => {
//     outgoingTone.pause();
//     outgoingTone.currentTime = 0;
//   };

//   return {
//     isCalling: false,
//     incomingCall: false,
//     inCall: false,
//     callerId: null,
//     receiverId: null,
//     peerConnection: null,
//     stopCallerRingtone,

//     // State setters
//     setPeerConnection: (pc) => set({ peerConnection: pc }),
//     setIncomingCall: (state) => set({ incomingCall: state }),
//     setCalling: (state) => set({ isCalling: state }),
//     setInCall: (state) => set({ inCall: state }),
//     setCallerId: (id) => set({ callerId: id }),
//     setReceiverId: (id) => set({ receiverId: id }),

//     // ------------------------------------------------
//     // START CALL — CALLER SIDE
//     // ------------------------------------------------
//     startCall: async (receiverId) => {
//       const socket = (window as any).mainSocket;

//       // Play outgoing ringtone
//       outgoingTone.play().catch(() => {});

//       set({ isCalling: true, receiverId });

//       // Create PeerConnection
//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       set({ peerConnection: pc });

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//       stream.getTracks().forEach((t) => pc.addTrack(t, stream));

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", {
//             to: receiverId,
//             candidate: event.candidate,
//           });
//         }
//       };

//       pc.ontrack = (event) => {
//         const audio = document.getElementById(
//           "remoteAudio"
//         ) as HTMLAudioElement;
//         audio!.srcObject = event.streams[0];
//         audio!.play().catch(() => {});
//       };

//       // Create WebRTC Offer
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);

//       socket.emit("call-user", { to: receiverId, offer });

//       // -----------------------------
//       // CALL TIMEOUT (30 seconds)
//       // -----------------------------
//       timeoutHandler = setTimeout(() => {
//         console.log("⏳ Call timeout — no answer");
//         get().cancelCall(); // auto cancel
//       }, 30000); // 30 seconds
//     },

//     // ------------------------------------------------
//     // ACCEPT CALL — RECEIVER SIDE
//     // ------------------------------------------------
//     acceptCall: async () => {
//       const { callerId, peerConnection } = get();
//       const socket = (window as any).mainSocket;

//       stopAllRingtones(); // stop incoming ringtone
//       if (timeoutHandler) clearTimeout(timeoutHandler);

//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });
//       stream.getTracks().forEach((t) => peerConnection?.addTrack(t, stream));

//       const answer = await peerConnection?.createAnswer();
//       await peerConnection?.setLocalDescription(answer);

//       socket.emit("answer-call", { to: callerId, answer });

//       set({ incomingCall: false, inCall: true });
//     },

//     // ------------------------------------------------
//     // RECEIVER SEES INCOMING CALL
//     // ------------------------------------------------
//     receiveCall: (from) => {
//       console.log("📥 receiveCall() triggered for:", from); // <------ ADD THIS

//       set({ incomingCall: true, callerId: from });

//       incomingTone.play().catch(() => {}); // play incoming ringtone

//       // Also timeout after 30s
//       timeoutHandler = setTimeout(() => {
//         console.log("⏳ Receiver did not respond");
//         get().rejectCall();
//       }, 30000);
//     },

//     // ------------------------------------------------
//     // CANCEL CALL (CALLER BEFORE ANSWER)
//     // ------------------------------------------------
//     cancelCall: () => {
//       const socket = (window as any).mainSocket;
//       const { receiverId, peerConnection } = get();

//       stopAllRingtones();
//       if (timeoutHandler) clearTimeout(timeoutHandler);

//       peerConnection?.close();
//       socket.emit("end-call", { to: receiverId });

//       set({
//         isCalling: false,
//         inCall: false,
//         incomingCall: false,
//         callerId: null,
//         receiverId: null,
//         peerConnection: null,
//       });
//     },

//     // ------------------------------------------------
//     // REJECT CALL — RECEIVER
//     // ------------------------------------------------
//     rejectCall: () => {
//       const socket = (window as any).mainSocket;
//       const { callerId } = get();

//       stopAllRingtones();
//       if (timeoutHandler) clearTimeout(timeoutHandler);

//       socket.emit("end-call", { to: callerId });

//       set({
//         incomingCall: false,
//         callerId: null,
//       });
//     },

//     // ------------------------------------------------
//     // END CALL (WHILE IN CALL)
//     // ------------------------------------------------
//     endCall: () => {
//       const socket = (window as any).mainSocket;
//       const { callerId, receiverId, peerConnection } = get();

//       stopAllRingtones();
//       if (timeoutHandler) clearTimeout(timeoutHandler);

//       peerConnection?.close();

//       socket.emit("end-call", { to: callerId || receiverId });

//       set({
//         isCalling: false,
//         inCall: false,
//         incomingCall: false,
//         callerId: null,
//         receiverId: null,
//         peerConnection: null,
//       });
//     },
//   };
// });

// ---------------------------
// CALL STORE (FIXED VERSION)
// ---------------------------

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

    startCall: async (receiverId) => {
      const socket = (window as any).mainSocket;

      outgoingTone.play().catch(() => {});
      set({ isCalling: true, receiverId });

      const pc = new RTCPeerConnection({
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        const audio = document.getElementById(
          "remoteAudio"
        ) as HTMLAudioElement;
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
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

    receiveCall: (from) => {
      set({ incomingCall: true, callerId: from });
      incomingTone.play().catch(() => {});

      timeoutHandler = setTimeout(() => {
        if (!get().inCall) get().rejectCall();
      }, 30000);
    },

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

    rejectCall: () => {
      const socket = (window as any).mainSocket;
      const { callerId } = get();

      stopAll();
      if (timeoutHandler) clearTimeout(timeoutHandler);

      socket.emit("end-call", { to: callerId });

      set({ incomingCall: false, callerId: null });
    },

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
