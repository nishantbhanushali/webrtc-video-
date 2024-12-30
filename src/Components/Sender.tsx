import { useEffect, useRef, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      ws.send(JSON.stringify({ type: "sender" }));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
      console.log("WebSocket connection closed.");
    };
  }, []);

  const startSendingVideo = async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected or open.");
      return;
    }

    try {
      // Create PeerConnection if not already created
      if (!pcRef.current) {
        pcRef.current = new RTCPeerConnection();
      }

      const pc = pcRef.current;

      // Handle ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("Sending ICE candidate:", e.candidate);
          socket.send(
            JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
          );
        }
      };

      // Negotiation needed event
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log("Sending offer:", offer);
        socket.send(
          JSON.stringify({
            type: "createOffer",
            sdp: pc.localDescription,
          })
        );
      };

      // Handle messages from the server
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "createAnswer" && data.sdp) {
          console.log("Received answer from server:", data.sdp);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === "iceCandidate") {
          console.log("Adding ICE candidate from server:", data.candidate);
          pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };

      // Get media stream and add tracks to PeerConnection
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
          const video = document.createElement("video");
          document.body.appendChild(video)
          video.srcObject = stream;
          video.play()
        });
        console.log("Added media stream tracks to PeerConnection.");
      }
    } catch (error) {
      console.error("Error during video transmission setup:", error);
    }
  };

  

  return (
    <>
      <div>Sender</div>
      <button onClick={startSendingVideo}>Start Sending Video</button>
    </>
  );
};

export default Sender;
