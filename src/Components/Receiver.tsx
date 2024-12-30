import { useEffect, useRef } from "react";

const Receiver = () => {
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket("ws://localhost:3000");
    const videoRef = useRef(null)

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    // Handle incoming WebSocket messages
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      

      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
      
        
        
        // Set remote description from offer received
        await pc.setRemoteDescription(message.sdp);

       

        // Create an answer and set local description
        const answer = await pc.createAnswer();
   
        await pc.setLocalDescription(answer);
        console.log(answer);

        // Send answer back to the server
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );

     


        pc.onicecandidate = (e) =>{
          console.log(e);
          if(e.candidate){
            socket.send(JSON.stringify({type :"iceCandidate", candidate :e.candidate}))
            console.log(e.candidate);
            
          }
          
        }

        pc.ontrack = (e) => {
          console.log(e);
          const video = document.createElement("video")
          video.srcObject = new MediaStream([e.track])
          video.play()

        };
        
        
        if(message.type === "iceCandidate"){
          pc.addIceCandidate(message.candidate)
          console.log(message.candidate)
        }

        console.log("Sending answer to the sender");

        
      }
    };

    
  }, []);

  return
  <>
   <div>Receiver</div>;
   <video ref = {videoRef} ></video>
  4</>
};

export default Receiver;
