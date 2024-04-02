import React, { useEffect, useRef } from 'react';
import Peer from 'peerjs';
const myPeer = new Peer(
  {
    host: '/',
    port: 3001,
  }
);
const peers = {};

export default function Room() {
  const videoGridRef = useRef(null);
  const myVideo = useRef(null);

  useEffect(() => {
    myVideo.current = document.createElement('video');
    myVideo.current.muted = true;

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo.current, stream);
    });

    function addVideoStream(video, stream) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      videoGridRef.current.append(video);
    }

    myPeer.on('open', id => {
      console.log(id);
    });

  }, []);

  return (
    <div ref={videoGridRef} id="video-grid"></div>
  );
}