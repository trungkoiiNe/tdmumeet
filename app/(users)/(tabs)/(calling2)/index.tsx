import React, { useState } from "react";
import { Button, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import HomeScreen from "./home";
import CallScreen from "./call";
const App = () => {
  const [inCall, setInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [username, setUsername] = useState("");

  const startCall = (data) => {
    console.log("startCall called with data:", data);
    setCallData(data);
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
    setCallData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {!inCall ? (
        <HomeScreen
          username={username}
          setUsername={setUsername}
          startCall={startCall}
        />
      ) : (
        <CallScreen callData={callData} username={username} endCall={endCall} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default App;
