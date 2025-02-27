import { View, Text, Button, Alert } from "react-native";
import React from "react";
import { useAuthStore } from "../../../stores/authStore";
const index = () => {
  const { logout } = useAuthStore();
  function getUser() {
    return console.log(useAuthStore.getState().getUser());
  }
  return (
    <>
      <Button title="Logout" onPress={logout} />
      <Button title="Get User" onPress={() => getUser()} />
    </>
  );
};

export default index;
