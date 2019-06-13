# WebRTC 

WebRTC는 Web RealTime Communication의 약자로 웹 브라우저 간에 실시간, 플러그인이 필요 없이 영상 및 음성, 데이터 통신에 대한 공개 된 표준이다.

즉, 별도의 프로그램 설치 없이 웹 브라우저 사이에 화상통신, 음성, 채팅을 가능하게 한다.

구글이 처음으로 WebRTC를 제안한 이후 Google, Mozilla, Opera 및 MS까지 기술적 표준을 만들어 가고 있다.

위에서 웹브라우저라고 한정을 시켰지만, 사실 웹브라우저에 제한되지 않는다. 그 이유는 webrtc 자체가 c++ native 로 작성되어있어서 현존 하는 기기들로 포팅이 용이하며, 이를 직접 빌드하여 사용할 수 있기 때문이다. 

이 문서에서는 검색만 하면 나오는 용어들의 설명은 최대한 하지 않을 것이며, 최대한 가장 간단한 예제를 보여주는 것이 목표다.

WebRTC 를 학습하면서 겪을 수 있는 어려운점을 최대한 풀어드리겠다.

# Tutorial Installation

git clone git@github.com:hsnks100/webrtc-examples.git

https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb

chrome extension 을 통해 01-webrtc-web-loopback 를 열어서 http://localhost:8887 입력 후, call 을 눌러본다.

# Loopback WebRTC

![image](https://user-images.githubusercontent.com/3623889/59394432-a436d080-8dba-11e9-986a-ac8794a3c7b6.png)

실행 시키면 위와 같은 화면이 뜨고 call 을 누르면 미리 준비되어있던 remote video 에 같은 영상이 뜰 것이다. 내가 원하는 것은 P2P 라고! 라고 외치기전에 loop-back 예제를 먼저 봐야하는 이유가 있다.

보통은 loop-back 예제를 한번 대충 실행시켜본 후, 그래 이제 실제 peer 간의 통신하는 예제를 찾으러 떠날 것이다. 이 때부터 복잡함이 시작된다. Signaling 이 포함된 예제를 보면 일단 등장하는 인물들이 많다. TURN, STUN, ICE, SDP, OFFER, ANSWER 생각나는대로 대충써도 이 정도이며 각 요소들이 독립적인 의미를 가지는 것도 아니며 network 상에서 어떻게 흐름이 흘러가는지 알기가 정말 어렵다. 이 쯤 됐으면 "에이 안해." 

차근차근 loop-back 예제부터 정복해보자. loop-back 예제만 잘 보고 Signaling server 를 어떻게 구축해야 하며 각 client 들은 어떤정보를 줘야 하는지 각을 잡을 수 있어야 한다. 

![image](https://user-images.githubusercontent.com/3623889/59333534-7a869680-8d33-11e9-9e86-17845d88f98b.png)

기본적인 webrtc 구동에 관한 Sequence Diagram 이다. 위 다이어그램을 보면서 아래 코드를 읽어야 한다.
그래도 이해하는데 필요한 SDP, ICE Candidate 에 대해서 살짝만 써보려 한다.

![image](https://user-images.githubusercontent.com/3623889/59395571-99cb0580-8dbf-11e9-8f09-0012edb227b9.png)

`ICE (Interactive Connectivity Establishment, RFC 5245)`

peer-to-peer 간 다이렉트로 통신을 위한 기술
ICE 는 이미지를 통해 이해하는 것이 편하다.
이미지와 같이 peer-to-peer 간에는 여러 가지 경로를 통해 연결될 수 있다.

Candidate 는 각 peer 의 setLocalDescription 의 콜백을 통해 구해지며, 최종적으로 서로에게 전송한다 그러면 각 peer 는 서로에게 Connectivity Check 를 하게 되고 p2p 로 

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
  const servers = null;  // Allows for RTC server configuration.  
  localPeerConnection = new RTCPeerConnection(servers);
  trace('Created local peer connection object localPeerConnection.'); 
  localPeerConnection.addEventListener('icecandidate', localIceCandidate);
  localPeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange); 
  remotePeerConnection = new RTCPeerConnection(servers);
  trace('Created remote peer connection object remotePeerConnection.'); 
  remotePeerConnection.addEventListener('icecandidate', remoteIceCandidate);
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
function localIceCandidate(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate; 
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    remotePeerConnection.addIceCandidate(newIceCandidate)
      .then(() => {
      }).catch((error) => {
      }); 
  }
}
function remoteIceCandidate(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate; 
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    localPeerConnection.addIceCandidate(newIceCandidate)
      .then(() => {
      }).catch((error) => {
      }); 
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


```js
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((mediaStream) => {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
  callButton.disabled = false;  // Enable call button.
});
```

먼저 브라우저한테 현재 연결된 카메라와 오디오의 스트림을 가져와 달라고 한다.  그 정보는 localStream 에 저장된다. localStream 은 추후 peer connection 객체에 추가된다.


```js
const servers = null;  // Allows for RTC server configuration.  
localPeerConnection = new RTCPeerConnection(servers);
trace('Created local peer connection object localPeerConnection.'); 
localPeerConnection.addEventListener('icecandidate', localIceCandidate);
localPeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange); 
remotePeerConnection = new RTCPeerConnection(servers);
trace('Created remote peer connection object remotePeerConnection.'); 
remotePeerConnection.addEventListener('icecandidate', remoteIceCandidate);
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
```

localPeerConnection, remotePeerConnection 두개가 초기화되는데, 이는 앞서 봤던 Sequence Diagram 의 A, B 와 매칭된다. 여기서 헷갈릴 수 있는점이, 실제 구현에서는 각 디바이스가 localPeerConnection 하나만을 가지고, remotePeerConnection 는 필요없다. 
icecandate 에 대한 event 는 들어온 sdp 의 정보를 파싱해서 들어온 candidate 가 있을 때 호출된다.

이 코드조각에서 가장 중요한 부분은 마지막 addEventListener 인 addstream 이다. remotePeerConnection 에 stream 이 들어올 때, 어디다가 화면을 뿌려줄 건지 정하는 것이다. 즉, local video stream 이 remote video stream 으로 전송이 되고 그것을 보여주는 코드다. 만약 구동되는 컴퓨터의 사양이 매우 안좋다면, remoteVideo 에 보여지는 화면이 localVideo 보다 살짝 느릴 것이다.  여기까지 기본코드가 끝이 난다.

```js 
localPeerConnection.createOffer()
    .then((description) => {
        localPeerConnection.setLocalDescription(description); 
        // description is needed to send via network in actual world.
        remotePeerConnection.setRemoteDescription(description);
        remotePeerConnection.createAnswer()
            .then((description) => {
                remotePeerConnection.setLocalDescription(description); 
                // description is needed to send via network in actual world.
                localPeerConnection.setRemoteDescription(description);
            }).catch(setSessionDescriptionError);
    }).catch(setSessionDescriptionError);
```

이제 Sequence Diagram 에 있는 상황에 대한 코드인데, 최대한 짧게 한눈에 보기위해 lambda 를 이용하여 표현했다.

먼저 createOffer 가 수행이 된다. 생성된 offer 는 localPeerConnection.setLocalDescription 을 이용하여 저장한다. 그리고 바로 remotePeerConnection.setRemoteDescription 하게 된다. 여기에서 실제 signaling server 를 이용한 구현에서는 네트워크를 이용하여 이 description 을 전송하여 받는 쪽에서 setRemoteDescription 하게 된다. 

offer 를 받은 쪽에서는 createAnswer 를 이용하여 답장을 한다. 마찬가지로 remotePeerConnection.setLocalDescription 로 바로 저장한다. 여기서도 localPeerConnection.setRemoteDescription 하는 부분이 있는데, 마찬가지로 네트워크를 이용하여 description 을 전송하여 받는 쪽에서 setRemoteDescription 한다.

```js

// Connects with new peer candidate.
function localIceCandidate(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate; 
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    remotePeerConnection.addIceCandidate(newIceCandidate)
      .then(() => {
      }).catch((error) => {
      }); 
  }
}
function remoteIceCandidate(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate; 
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    localPeerConnection.addIceCandidate(newIceCandidate)
      .then(() => {
      }).catch((error) => {
      }); 
  }
}
```

다음으로 ICE candidate 를 받았을 때 하는 행동을 보자. localIceCandidate/remoteIceCandidate 에 들어온 candidate 는 상대방에게 전달되어야 하는 candidate 다. 이 예제에서 전달하는 부분은 loop-back 예제이므로 생략되었다. 

`대신 remoteIceCandidate 에서는 localPeerConnection.addIceCandidate 
localIceCandidate 에서는 remotePeerConnection.addIceCandidate`

이 과정이 끝나고 나면 영상이 뜰 것이다. 축하한다. 


