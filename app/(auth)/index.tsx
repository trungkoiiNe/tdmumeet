import { View, Text, Button } from "react-native";
import React from "react";
import { useAuthStore } from "../../stores/authStore";

const login = () => {
  const { login, logout, getUser } = useAuthStore();

  return (
    <>
      <Button title="Login" onPress={login} />
      <Button title="Logout" onPress={logout} />
      <Button title="Get User" onPress={() => alert(getUser)} />
    </>
  );
};

export default login;
