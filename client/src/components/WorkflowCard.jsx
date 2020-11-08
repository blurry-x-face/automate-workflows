import React from "react";
import { Divider, Menu, Dropdown, Button, Typography, Card } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";

const gmailType = ["NEW_MESSAGES", "STAR", "FROM_ONLY"];
const { Title, Text } = Typography;

export default function WorkflowCard(props) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Card
      title={
        <div
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <Text> {props.title} </Text>
          <Button type="text" style={{ textAlign: "right" }}>
            <CaretDownOutlined />
          </Button>
        </div>
      }
    >
      {collapsed ? null : (
        <div className="workflow-card-content">{props.children}</div>
      )}
    </Card>
  );
}
