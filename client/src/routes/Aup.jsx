import React from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

export default function Aup({ match }) {
  const [aupData, setAupData] = React.useState({});
  const [cookies, setCookie] = useCookies(["currentaup"]);
  // console.log(match);
  React.useEffect(() => {
    axios
      .get(`http://localhost:4000/api/aup/currentaup/${match.params.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status == 200) setCookie(res.data.id);
        console.log(res);
      });
    axios
      .get(`http://localhost:4000/api/aup/get/${match.params.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status == 200) setAupData(res.data);
        console.log(res.data);
      });
  }, []);
  return (
    <div>
      <h1>Hello</h1>
      <p>{match.params.id} wale route pe ho bc</p>
    </div>
  );
}
