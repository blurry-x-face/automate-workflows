import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Divider } from "antd";
export default function Workflows() {
  const [workflows, setWorkflows] = React.useState([]);
  React.useEffect(() => {
    axios
      .get("/api/aup/list", { withCredentials: true })
      .then((res) => {
        if (res.status == 200) setWorkflows(res.data);
      })
      .catch((e) => console.log(e));
  }, []);
  return (
    <div>
      <p>Aup List</p>
      {workflows.map((v, i) => {
        return (
          <>
            <Link to={`/aup/${v._id}`}>{v.aupName}</Link>
            <Divider orientation="center">-</Divider>
          </>
        );
      })}
    </div>
  );
}
