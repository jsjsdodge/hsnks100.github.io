# WebRTC 

WebRTC는 Web RealTime Communication의 약자로 웹 브라우저 간에 실시간, 플러그인이 필요 없이 영상 및 음성, 데이터 통신에 대한 공개 된 표준이다.

즉, 별도의 프로그램 설치 없이 웹 브라우저 사이에 화상통신, 음성, 채팅을 가능하게 한다.

구글이 처음으로 WebRTC를 제안한 이후 Google, Mozilla, Opera 및 MS까지 기술적 표준을 만들어 가고 있다.

위에서 웹브라우저라고 한정을 시켰지만, 사실 웹브라우저에 제한되지 않는다. 그 이유는 webrtc 자체가 c++ native 로 작성되어있어서 현존 하는 기기들로 포팅이 용이하며, 이를 직접 빌드하여 사용할 수 있기 때문이다. 비교적 포팅이 쉽다는 것이지, 실제 임베디드 장비로 포팅을 하는경우 드는 노력과 비용이 무시 할만한 수준은 아니다. 

이 문서에서는 검색만 하면 나오는 용어들의 설명은 최대한 하지 않을 것이며, 최대한 가장 간단한 예제를 보여주는 것이 목표다.

WebRTC 를 학습하면서 겪을 수 있는 어려운점을 최대한 풀어드리겠다.

# Tutorial Installation

git clone this-repo

https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

# Loopback WebRTC

실행 시키면 위와 같은 화면이 뜨고 call 을 누르면 미리 준비되어있던 remote video 에 같은 영상이 뜰 것이다. 내가 원하는 것은 P2P 라고! 라고 외치기전에 loop-back 예제를 먼저 봐야하는 이유가 있다.

보통은 loop-back 예제를 한번 대충 실행시켜본 후, 그래 이제 실제 peer 간의 통신하는 예제를 찾으러 떠날 것이다. 이 때부터 복잡함이 시작된다. Signaling 이 포함된 예제를 보면 일단 등장하는 인물들이 많다. TURN, STUN, ICE, SDP, OFFER, ANSWER 생각나는대로 대충써도 이 정도이며 각 요소들이 독립적인 의미를 가지는 것도 아니며 network 상에서 어떻게 흐름이 흘러가는지 알기가 정말 어렵다. 이 쯤 됐으면 "에이 안해." 

차근차근 loop-back 예제부터 정복해보자. loop-back 예제만 잘 보고 Signaling server 를 어떻게 구축해야 하며 각 client 들은 어떤정보를 줘야 하는지 각을 잡을 수 있어야 한다. 



```js
'use strict';

// Define initial start time of the call (defined as connection between peers).
let startTime = null;

// Define peer connections, streams and video elements.
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;

let localPeerConnection;
let remotePeerConnection;
// Define action buttons.
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

// Add click event handlers for buttons.
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;
hangupButton.disabled = true;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((mediaStream) => {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
  trace('Received local stream.');
  callButton.disabled = false;  // Enable call button.
}).catch(handleLocalMediaStreamError);
trace('Requesting local stream.'); 
// Handles error by logging a message to the console.
function handleLocalMediaStreamError(error) {
  trace(`navigator.getUserMedia error: ${error.toString()}.`);
} 
// Define RTC peer connection behavior.


// Handles call button action: creates peer connection.
function callAction() {
  callButton.disabled = true;
  hangupButton.disabled = false; 
  trace('Starting call.');
  startTime = window.performance.now(); 
  // Get local media stream tracks.
  const videoTracks = localStream.getVideoTracks();
  const audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    trace(`Using video device: ${videoTracks[0].label}.`);
  }
  if (audioTracks.length > 0) {
    trace(`Using audio device: ${audioTracks[0].label}.`);
  } 
  const servers = null;  // Allows for RTC server configuration.  
  // Create peer connections and add behavior.
  localPeerConnection = new RTCPeerConnection(servers);
  trace('Created local peer connection object localPeerConnection.'); 
  localPeerConnection.addEventListener('icecandidate', handleConnection);
  localPeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange); 
  remotePeerConnection = new RTCPeerConnection(servers);
  trace('Created remote peer connection object remotePeerConnection.'); 
  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange);
  remotePeerConnection.addEventListener('addstream', (event) => {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
  }); 
  // Add local stream to connection and create offer to connect.
  localPeerConnection.addStream(localStream);
  trace('Added local stream to localPeerConnection.'); 
  trace('localPeerConnection createOffer start.');
  localPeerConnection.createOffer()
    .then((description) => {
      trace(`Offer from localPeerConnection:\n${description.sdp}`); 
      trace('localPeerConnection setLocalDescription start.');
      localPeerConnection.setLocalDescription(description); 
      trace('remotePeerConnection setRemoteDescription start.');
      remotePeerConnection.setRemoteDescription(description);
      trace('remotePeerConnection createAnswer start.');
      remotePeerConnection.createAnswer()
        .then((description) => {
          trace(`Answer from remotePeerConnection:\n${description.sdp}.`); 
          trace('remotePeerConnection setLocalDescription start.');
          remotePeerConnection.setLocalDescription(description); 
          trace('localPeerConnection setRemoteDescription start.');
          localPeerConnection.setRemoteDescription(description);
        }).catch(setSessionDescriptionError);
    }).catch(setSessionDescriptionError);
} 
// Handles hangup action: ends up call, closes connections and resets peers.
function hangupAction() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  trace('Ending call.');
} 
// Define helper functions.  
// Gets the "other" peer connection.
function getOtherPeer(peerConnection) {
  return (peerConnection === localPeerConnection) ?
      remotePeerConnection : localPeerConnection;
} 
// Gets the name of a certain peer connection.
function getPeerName(peerConnection) {
  return (peerConnection === localPeerConnection) ?
      'localPeerConnection' : 'remotePeerConnection';
} 
// Connects with new peer candidate.
function handleConnection(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate; 
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection); 
    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        trace(`${getPeerName(peerConnection)} addIceCandidate success.`);
      }).catch((error) => {
        trace(`${getPeerName(peerConnection)} failed to add ICE Candidate:\n`+
              `${error.toString()}.`);
      }); 
    trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
          `${event.candidate.candidate}.`);
  }
}

// Logs changes to the connection state.
function handleConnectionChange(event) {
  const peerConnection = event.target;
  console.log('ICE state change event: ', event);
  trace(`${getPeerName(peerConnection)} ICE state: ` +
        `${peerConnection.iceConnectionState}.`);
}

// Logs error when setting session description fails.
function setSessionDescriptionError(error) {
  trace(`Failed to create session description: ${error.toString()}.`);
}

// Logs an action (text) and the time when it happened on the console.
function trace(text) {
  text = text.trim();
  const now = (window.performance.now() / 1000).toFixed(3);

  console.log(now, text);
}

```

사용자는 맨 처음 call 버튼을 누르면서 loop-back 예제가 시작된다.







