var pc = null;

function negotiate() {
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });
    return pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
    }).then(() => {
        // wait for ICE gathering to complete
        return new Promise((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                };
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(() => {
        var offer = pc.localDescription;
        var avatarName = document.getElementById('avatar-name').value;  // 获取 TTS 选择框的值
        var ttsSelection = document.getElementById('tts-selection').value;  // 获取文本框里的消息
        var avatarVoice = document.getElementById('avatar-voice').value;  // 获取 sessionid（假设也在页面上）

        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                avatarName: avatarName,  
                ttsSelection: ttsSelection,            
                avatarVoice: avatarVoice         // 添加 sessionid
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then((response) => {
        return response.json();
    }).then((answer) => {
        document.getElementById('sessionid').value = answer.sessionid
        return pc.setRemoteDescription(answer);
    }).catch((e) => {
        alert(e);
    });
}

function start() {
    var config = {
        sdpSemantics: 'unified-plan'
    };
	
	var videoElement = document.getElementById('video');
	videoElement.src='./video/active.mp4';
	videoElement.loop = false; 

    if (document.getElementById('use-stun').checked) {
        config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
    }

    pc = new RTCPeerConnection(config);

    // connect audio / video
    pc.addEventListener('track', (evt) => {
        if (evt.track.kind == 'video') {
			var videoElement = document.getElementById('video');
			        videoElement.srcObject = evt.streams[0];
			        videoElement.loop = false; 
            // document.getElementById('video').srcObject = evt.streams[0];
        } else {
            document.getElementById('audio').srcObject = evt.streams[0];
        }
    });

    document.getElementById('start').style.display = 'none';
    negotiate();
    document.getElementById('stop').style.display = 'inline-block';
}

function stop() {
    console.log("********************666***********************************");
    // document.getElementById('stop').style.display = 'none';
    console.log("********************777***********************************");

    // close peer connection
    setTimeout(() => {
        pc.close();
    }, 500);
    console.log("********************888***********************************");
}

function stop2() {
    console.log("********************stop***********************************");

    if (pc) {
        pc.close();
        pc = null; 
    }

    // 如果你还需要清理音频/视频流等资源，可以在这里添加更多清理代码
    // document.getElementById('video').srcObject = null;
    // document.getElementById('audio').srcObject = null;

    document.getElementById('stop').style.display = 'none';

    console.log("********************stop completed***********************************");
}

document.getElementById('tts-selection').addEventListener('change', function () {
    stop2();

    var ttsSelection = this.value;
    console.log("Selected TTS:", ttsSelection);

    start();
});

document.getElementById('avatar-name').addEventListener('change', function () {
    stop2();

    var ttsSelection = this.value;
    console.log("Selected TTS:", ttsSelection);

    start();
});
