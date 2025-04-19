import { useState, useRef, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  View,
  Text,
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
} from "react-native";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  mediaDevices,
} from "react-native-webrtc";
import React from "react";
import {
  doc,
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  getFirestore,
  getDoc,
  updateDoc,
  arrayUnion,
} from "@react-native-firebase/firestore";

export default function CallScreen() {
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const db = getFirestore();

  const servers = {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:asia.relay.metered.ca:80",
        username: "fd7b55b25f116006cf4e103f",
        credential: "hOUNWy9Sf8zKGXGg",
      },
      {
        urls: "turn:asia.relay.metered.ca:80?transport=tcp",
        username: "fd7b55b25f116006cf4e103f",
        credential: "hOUNWy9Sf8zKGXGg",
      },
      {
        urls: "turn:asia.relay.metered.ca:443",
        username: "fd7b55b25f116006cf4e103f",
        credential: "hOUNWy9Sf8zKGXGg",
      },
      {
        urls: "turns:asia.relay.metered.ca:443?transport=tcp",
        username: "fd7b55b25f116006cf4e103f",
        credential: "hOUNWy9Sf8zKGXGg",
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const startWebcam = async () => {
    try {
      pc.current = new RTCPeerConnection(servers);
      const local = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(local);
      const remote = new MediaStream();
      setRemoteStream(remote);

      // Add all tracks from local stream to the peer connection
      local.getTracks().forEach((track) => {
        try {
          pc.current.addTrack(track, local);
        } catch (error) {
          console.error(error);
        }
      });

      // Listen for tracks from remote stream
      pc.current.addEventListener("track", (event) => {
        if (event.streams && event.streams[0]) {
          console.log("got stream");
          remote.addTrack(event.track);
          setRemoteStream(remote);
        } else {
          console.log("no stream");
          remote.addTrack(event.track);
          setRemoteStream(remote);
        }
      });
      setWebcamStarted(true);
    } catch (error) {
      console.error(error);
    }
  };
  const startCall = async () => {
    try {
      const channelDoc = doc(
        collection(
          db,
          "teams",
          "12bbfa26-eaac-4e43-b228-677e27cdc3e4",
          "channels",
          "3c37ba43-3155-42e2-a596-9083bc651275",
          "Calls"
        )
      );
      setChannelId(channelDoc.id);

      // Initialize the document with empty arrays for candidates
      await setDoc(channelDoc, {
        offer: null,
        answer: null,
        offerCandidates: [],
        answerCandidates: [],
      });

      pc.current.addEventListener("icecandidate", async (event) => {
        if (event.candidate) {
          // Update document by adding to the offerCandidates array
          await updateDoc(channelDoc, {
            offerCandidates: [
              ...((await getDoc(channelDoc)).data().offerCandidates || []),
              event.candidate.toJSON(),
            ],
          });
        }
      });

      const offerDescription = await pc.current.createOffer({});
      await pc.current.setLocalDescription(offerDescription);
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await updateDoc(channelDoc, { offer });

      onSnapshot(channelDoc, (snapshot) => {
        const data = snapshot.data();
        if (data?.answer && !pc.current.remoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.current.setRemoteDescription(answerDescription);
        }

        // Process any new answer candidates
        if (data?.answerCandidates && data.answerCandidates.length > 0) {
          const processedCandidates = new Set();
          data.answerCandidates.forEach((candidateData) => {
            const candidateString = JSON.stringify(candidateData);
            if (!processedCandidates.has(candidateString)) {
              pc.current.addIceCandidate(new RTCIceCandidate(candidateData));
              processedCandidates.add(candidateString);
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };
  const joinCall = async () => {
    try {
      if (!channelId) {
        console.error("No channel ID provided to join");
        return;
      }
      // Use the channelId state to reference the correct document
      const channelDoc = doc(
        collection(
          db,
          "teams",
          "12bbfa26-eaac-4e43-b228-677e27cdc3e4",
          "channels",
          "3c37ba43-3155-42e2-a596-9083bc651275",
          "Calls"
        ),
        channelId
      );
      const channelDocument = await getDoc(channelDoc);
      if (!channelDocument.exists) {
        console.error("Call document does not exist");
        return;
      }

      const channelData = channelDocument.data();
      if (!channelData?.offer) {
        console.error("No offer available in this call");
        return;
      }

      pc.current.addEventListener("icecandidate", async (event) => {
        if (event.candidate) {
          // Update document by adding to the answerCandidates array
          await updateDoc(channelDoc, {
            answerCandidates: arrayUnion(event.candidate.toJSON()),
          });
        }
      });

      // Rest of the function remains the same...
      const offerDescription = channelData.offer;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };
      await updateDoc(channelDoc, { answer });
      // Listen for changes to the document to get offer candidates
      onSnapshot(channelDoc, (snapshot) => {
        const data = snapshot.data();
        if (data?.offerCandidates && data.offerCandidates.length > 0) {
          const processedCandidates = new Set();
          data.offerCandidates.forEach((candidateData) => {
            const candidateString = JSON.stringify(candidateData);
            if (!processedCandidates.has(candidateString)) {
              pc.current.addIceCandidate(new RTCIceCandidate(candidateData));
              processedCandidates.add(candidateString);
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.body} behavior="position">
      <SafeAreaView>
        {/* {localStream && (
          <RTCView
            streamURL={localStream?.toURL()}
            style={styles.stream}
            objectFit="cover"
            mirror
          />
        )} */}

        {remoteStream && (
          <RTCView
            streamURL={remoteStream?.toURL()}
            style={styles.stream}
            objectFit="cover"
            mirror
          />
        )}
        <View style={styles.buttons}>
          {!webcamStarted && (
            <Button title="Start webcam" onPress={startWebcam} />
          )}
          {webcamStarted && <Button title="Start call" onPress={startCall} />}
          {webcamStarted && (
            <View style={{ flexDirection: "row" }}>
              <Button title="Join call" onPress={joinCall} />
              <TextInput
                value={channelId}
                placeholder="callId"
                style={{ borderWidth: 1, padding: 5 }}
                onChangeText={(newText) => setChannelId(newText)}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stream: {
    width: 200,
    height: 200,
    backgroundColor: "black",
  },
  buttons: {
    marginTop: 20,
  },
});
