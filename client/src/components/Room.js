import React, { useEffect, useState } from 'react';
// import { useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';

const VideoChat = () => {
  // const [peers, setPeers] = useState({});
  const [streams, setStreams] = useState([]);
  // const videoGridRef = useRef();

  const { roomId } = useParams();
  const socket = useSocket();

  useEffect(() => {
    const myPeer = new Peer();
    // const myVideo = document.createElement('video');
    // myVideo.muted = true;
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      // addVideoStream(myVideo, stream);
      setStreams(prevStreams => [...prevStreams, stream]);

      // myPeer.on('call', call => {
      //   call.answer(stream);
      //   const video = document.createElement('video');
      //   call.on('stream', userVideoStream => {
      //     addVideoStream(video, userVideoStream);
      //   });
      // });

      socket.on('user-connected', peerId => {
        connectToNewUser(peerId, stream);
        console.log("user-connected", peerId);
      });
    });

    socket.on('user-disconnected', peerId => {
      // if (peers[userId]) peers[userId].close();
      console.log("user-disconnected", peerId);
    });

    myPeer.on('open', peerId => {
      socket.emit('join-room', roomId, peerId);
      // console.log("roomId", roomId, "peerId", peerId, "socket", socket);
    });

    // function connectToNewUser(peerId, stream) {
    //   const call = myPeer.call(peerId, stream);
    //   const video = document.createElement('video');
    //   call.on('stream', userVideoStream => {
    //     addVideoStream(video, userVideoStream);
    //   });
    //   call.on('close', () => {
    //     video.remove();
    //   });
    //   setPeers(prevPeers => ({ ...prevPeers, [peerId]: call }));
    // }

    // function addVideoStream(video, stream) {
    //   video.srcObject = stream;
    //   video.addEventListener('loadedmetadata', () => {
    //     video.play();
    //   });
    //   videoGridRef.current.append(video);
    // }

    return () => {
      myPeer.off('open');
      socket.off('user-connected');
      socket.off('join-room');
      socket.off('user-disconnected');
      socket.disconnect();
      myPeer.destroy();
    };
  }, []);

  return (
    <div>
      {/* {streams.map((stream, index) => ( */}
      {/* Why the below video is displayed twice if there is only one stream? */}
      {/* <video key={index} autoPlay playsInline ref={video => { */}
      {/* if (video) video.srcObject = stream; */}
      {/* }} /> */}
      {/* ))} */}
      {streams.map((stream, index) => (
        stream.active && <video key={index} autoPlay playsInline ref={video => {
          if (video) video.srcObject = stream;
        }} />
      ))}
    </div>
  );
};

export default VideoChat;