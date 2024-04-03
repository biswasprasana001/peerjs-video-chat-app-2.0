import React, { useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useSocket } from '../context/SocketProvider';
import { useParams } from 'react-router-dom';
const myPeer = new Peer(
  {
    host: '/',
    port: 3001,
  }
);

export default function Room() {
  const peers = {};
  const videoGridRef = useRef(null);
  const myVideo = useRef(null);
  const video = useRef(null);

  const { roomId } = useParams();
  const socket = useSocket();

  useEffect(() => {
    myVideo.current = document.createElement('video');
    myVideo.current.muted = true;
    let stream;

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(currentStream => {
      stream = currentStream;
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
      socket.emit('join-room', roomId, id);
    });

    socket.on('user-connected', userId => {
      // Issue starts after here
      connectToNewUser(userId, stream);
    });

    function connectToNewUser(userId, stream) {
      const call = myPeer.call(userId, stream)
      video.current = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video.current, userVideoStream)
      })
      call.on('close', () => {
        video.current.remove()
      })

      peers[userId] = call
    }

    myPeer.on('call', call => {
      if (!peers[call.peer]) {
        call.answer(stream);
        video.current = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video.current, userVideoStream);
        });
        peers[call.peer] = call;
      }
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) {
        peers[userId].close();
      }
    });

    return () => {
      socket.off('user-connected');
      myPeer.off('call');
    }

  }, []);

  return (
    <div ref={videoGridRef} id="video-grid"></div>
  );
}