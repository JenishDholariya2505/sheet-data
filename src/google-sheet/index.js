import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import Title from "antd/es/typography/Title";
import { Icon } from "@iconify/react/dist/iconify.js";
const GoogleSheetPage = (props) => {
  const { details } = props;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const url = details?.fullUrl || "";
  const fetchData = async (sheetUrl = url) => {
    try {
      setLoading(true);
      setError(null);

      const encodedUrl = encodeURIComponent(sheetUrl);
      const response = await axios.get(
        `http://localhost:3333/get-sheet-data?url=${encodedUrl}`
      );
      console.log(response, "response");

      if (response.data && response.data.data) {
        const headers = response.data.data[0] || [];

        setColumns(Object.keys(headers));
        setData(response.data.data);
        message.success("Data loaded successfully");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const asin = columns?.filter((d) => d?.toLowerCase()?.includes("asin"))?.[0];

  return (
    <>
      <Row>
        <Col span={24}>
          <Input
            placeholder="Enter Google Sheet URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={() => fetchData()}
            allowClear
          />
        </Col>
      </Row>
      <Card
        style={{
          background: "#ffffff",
          border: "1px solid #91caff",
          boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
          marginTop: "10px",
          marginBottom: "10px",
        }}
        bodyStyle={{
          padding: "0 10px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {error && (
            <div style={{ color: "red", marginBottom: "16px" }}>
              Error: {error}
            </div>
          )}

          <Spin spinning={loading}>
            <Table
              columns={[
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <Space>
                      <Icon
                        onClick={() => {
                          if (!asin) {
                            message.destroy();
                            message.warning("ASIN not found");
                            return;
                          }
                          window.open(
                            `https://www.amazon.com/dp/${record?.[asin]}?url=${url}`,
                            "_blank"
                          );
                        }}
                        width={60}
                        icon="lineicons:amazon"
                      />
                    </Space>
                  ),
                },
                ...columns?.map((d) => ({
                  title: d,
                  dataIndex: d,
                  key: d,
                  render: (e) => {
                    return asin === d ? (
                      <Tag color="blue">{e || "-"}</Tag>
                    ) : (
                      e || "-"
                    );
                  },
                  width: "max-content", // Set width to max-content for each column
                })),
              ]}
              dataSource={data}
              scroll={{ x: "max-content" }}
              pagination={false}
            />
          </Spin>
        </Space>
      </Card>
    </>
  );
};

export default GoogleSheetPage;
