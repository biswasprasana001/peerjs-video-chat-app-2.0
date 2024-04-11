// client\src\components\Room.js
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';

const VideoChat = () => {
  const [streams, setStreams] = useState([]);
  const [peers, setPeers] = useState([]);

  const { roomId } = useParams();
  const socket = useSocket();

  function connectToNewUser(myPeer, peerId, stream) {
    const call = myPeer.call(peerId, stream);
    call.on('stream', userVideoStream => {
      setStreams(prevStreams => [...prevStreams, userVideoStream]);
      setPeers(prevPeers => [...prevPeers, peerId]);
    })
  }

  useEffect(() => {
    const myPeer = new Peer();
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      setStreams(prevStreams => [...prevStreams, stream]);

      myPeer.on('call', call => {
        call.answer(stream);
        call.on('stream', userVideoStream => {
          setStreams(prevStreams => [...prevStreams, userVideoStream]);
        })
      });

      socket.on('user-connected', peerId => {
        connectToNewUser(myPeer, peerId, stream);
        console.log("user-connected", peerId);
      });
    });


    socket.on('user-disconnected', peerId => {
      console.log("user-disconnected", peerId);
      setPeers(prevPeers => prevPeers.filter(peer => peer !== peerId));
      setStreams(prevStreams => prevStreams.filter(stream => stream.peerId !== peerId));
    });

    myPeer.on('open', peerId => {
      socket.emit('join-room', roomId, peerId);
    });

    return () => {
      myPeer.off('open');
      myPeer.off('call');
      socket.off('user-connected');
      socket.off('join-room');
      socket.off('user-disconnected');
      socket.disconnect();
      myPeer.destroy();

    };
  }, []);

  return (
    <div>
      {streams
        .filter((stream, index) => index === streams.indexOf(stream))
        .map((stream, index) => (
          <video key={index} autoPlay playsInline ref={video => {
            if (video) video.srcObject = stream;
          }} />
        ))}
    </div>
  );
};

export default VideoChat;