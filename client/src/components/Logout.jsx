import React from "react";
import { useCookies } from "react-cookie";

export default function Logout() {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const handleClick = () => {
    setCookie("token", "", { path: "/", expires: 0 });
    window.location = "/";
  };

  return <a onClick={handleClick}>Logout</a>;
}
