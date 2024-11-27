import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import axios from "axios";
import React, { useState } from "react";
const GoogleSheetPage = (props) => {
  const { details } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const [tableLoading, setTableLoading] = useState(false);
  const [keys, setKeys] = useState({
    asin: "ASIN",
    price: "Sales",
  });

  const handleCloseTab = () => {
    setKeys({
      asin: "New ASIN",
      price: "Price",
    });
    // Robust tab closing using multiple methods
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.remove(tabs[0].id, () => {
            // Optional: handle any errors
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        }
      });
    } else if (window.close) {
      // Fallback for popup windows
      window.close();
    }
  };
  const postData = async (ASIN, url, values, values_) => {
    message.destroy();
    message.loading("Updating data...");
    const apiUrl = "https://google-sheet-apis.onrender.com/update-sheet-data";
    const queryParams = `?url=${url}`;
    const data = {
      asin: ASIN,
      [values_?.price]: values,
      keys: {
        ...values_,
      },
    };

    try {
      const result = await axios.post(`${apiUrl}${queryParams}`, data);
      if (result) {
        message.destroy();
        message.success("Data updated successfully");
        setTableLoading(true);
        fetchData(url, values_);
      }
    } catch (error) {
      message.destroy();
      message.error("Failed to post data");
    }
  };

  const getCurrentTab = async (ASIN, sheetUrl, values__) => {
    try {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => document.documentElement.outerHTML,
      });

      const parser = new DOMParser();
      const doc = parser.parseFromString(result, "text/html");

      const Id = doc.getElementById("h10-product-score");

      if (Id) {
        const values_ =
          Id?.getElementsByClassName("sc-gZdaQk jFTCxu")?.[0]?.childNodes;
        const values_other =
          Id?.getElementsByClassName("sc-cNVUXh ggrziX")?.[0]?.childNodes;

        const values = values_?.[0]?.data || values_other?.[0]?.data || null;

        if (!values) {
          setTimeout(async () => {
            message.destroy();
            message.warning("Retrying to get values...");
            await getCurrentTab(ASIN, sheetUrl, values__);
          }, 2000);
        } else {
          message.destroy();
          postData(ASIN, sheetUrl, values, values__);
        }
      } else {
        setTimeout(async () => {
          message.destroy();
          message.warning("Retrying to get values...");
          await getCurrentTab(ASIN, sheetUrl, values__);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChangeURL = (ASIN, sheetUrl, values) => {
    message.loading("Redirecting...", 0);
    const url_ = `https://www.amazon.com/dp/${ASIN}?url=${sheetUrl}`;
    console.log(url_, "url_");

    try {
      chrome.runtime.sendMessage({ type: "CHANGE_TAB_URL", url: url_ });
      message.destroy();
      message.loading("Fetching values...", 0);
      setTimeout(() => {
        getCurrentTab(ASIN, sheetUrl, values);
      }, 1000);
    } catch (error) {
      console.log(error);
      message.destroy();
      message.error("Failed to redirect");
    }
  };

  const fetchData = async (sheetUrl, values) => {
    try {
      setTableLoading(true);
      const encodedUrl = encodeURIComponent(sheetUrl);
      const response = await axios.get(
        `https://google-sheet-apis.onrender.com/get-sheet-data?url=${encodedUrl}`
      );
      if (response.data && response.data.data) {
        const record = response.data.data
          ?.map((d) => ({
            ASIN: d?.[values?.asin],
            Price: d?.[values?.price],
          }))
          ?.filter((d) => !d?.Price);
        if (record?.length > 0) {
          setTimeout(() => {
            handleChangeURL(record?.[0]?.ASIN, sheetUrl, values);
          }, 500);
        } else {
          handleCloseTab();
        }
        setData(record);
        setTableLoading(false);
      } else {
        setTableLoading(false);
      }
    } catch (err) {
      setTableLoading(false);
      message.error("Failed to load data");
    } finally {
      setTableLoading(false);
    }
  };

  const onFinish = (values) => {
    setKeys({
      asin: values?.asin,
      price: values?.price,
    });

    fetchData(values?.search, values);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          search:
            "https://docs.google.com/spreadsheets/d/1yIYJXR02iyTmwcx7mPeN2HWIvhigF8hKiSFcHepf95A/edit?th=1&psc=1&gid=1020242504#gid=1020242504",
          ...keys,
        }}
        style={{ margin: "auto" }}
      >
        <Row gutter={16} align="bottom">
          <Col span={6}>
            <Form.Item
              label="Search"
              name="search"
              rules={[{ required: true, message: "Google Sheet URL!" }]}
            >
              <Input placeholder="Enter search term" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="ASIN"
              name="asin"
              rules={[{ required: true, message: "ASIN key!" }]}
            >
              <Input placeholder="ASIN Key" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price key!" }]}
            >
              <Input placeholder="Price Key" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button
                style={{ position: "relative", top: "8px" }}
                type="primary"
                htmlType="submit"
                block
              >
                Search
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {keys?.asin && keys?.price ? (
        <>
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
              <Table
                loading={tableLoading}
                columns={[
                  {
                    title: "ASIN",
                    dataIndex: "ASIN",
                    key: "ASIN",
                    render: (e) => {
                      return <Tag color="blue">{e || "-"}</Tag>;
                    },
                  },
                ]}
                dataSource={data}
                scroll={{ x: "max-content" }}
                pagination={false}
              />
            </Space>
          </Card>
        </>
      ) : (
        <div style={{ height: "400px" }}>
          <Empty
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              width: "fit-content",
              height: "fit-content",
            }}
          />
        </div>
      )}
    </>
  );
};

export default GoogleSheetPage;
