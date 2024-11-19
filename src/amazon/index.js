import React, { useEffect, useState } from "react";
import { Button, message, Space, Typography } from "antd";
import axios from "axios";

const { Text } = Typography;
const AmazonPage = (props) => {
  const { details } = props;
  const url = details?.fullUrl || "";
  const [values, setValues] = useState(null);
  const [helliumTenStatus, setHelliumTenStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const parseURL = (urlString) => {
    try {
      const url = new URL(urlString);

      // Get search params
      const searchParams = {};
      url.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      return {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname?.match(/\/dp\/([A-Z0-9]+)/)[1],
        sheet_url: searchParams?.url,
      };
    } catch (error) {
      return null;
    }
  };
  const exampleURL = url;
  const parsedURL = parseURL(exampleURL);
  const SHEET_URL = parsedURL?.sheet_url;
  const ASIN = parsedURL?.pathname;

  const getDomDetails = () => {
    setLoading(true);
    chrome.runtime.sendMessage("get_dom", (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        const html = response?.html;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const Id = doc.getElementById("h10-product-score");
        console.log(Id, "IdIdId");
        if (Id) {
          setValues(
            Id?.childNodes?.[0]?.childNodes?.[0].childNodes?.[1]
              ?.childNodes?.[1]?.childNodes?.[0]?.childNodes?.[0]
              ?.childNodes?.[1]?.childNodes?.[0]?.data
          );
          setHelliumTenStatus(true);
          setLoading(false);
        } else {
          setLoading(false);
          setHelliumTenStatus(false);
        }
      }
    });
  };

  useEffect(() => {
    getDomDetails();
    return () => {};
  }, []);

  const postData = async () => {
    message.destroy();
    message.loading("Updating data...");
    const apiUrl = "http://localhost:3333/update-sheet-data";
    const queryParams = `?url=${SHEET_URL}`;
    const data = {
      "New ASIN": ASIN,
      "New Price": parseInt(values?.replace(/[# ,]/g, ""), 10),
    };
    try {
      const result = await axios.post(`${apiUrl}${queryParams}`, data);
      if (result) {
        message.destroy();
        message.success("Data updated successfully");

        setTimeout(() => {
          window.close();
        }, 2000);
      }
    } catch (error) {
      message.destroy();
      message.error("Failed to post data");
    }
  };

  return (
    <div>
      <h1>Amazon</h1>
      {!loading && !helliumTenStatus ? (
        <Text type="danger">Hellium 10 not found</Text>
      ) : (
        <>
          <Space direction="vertical" justify="start">
            <Text>Sheet URL: {SHEET_URL}</Text>
            <Text type="secondary">ASIN: {ASIN}</Text>
            <Text type="success">Value: {values || 0}</Text>
            <Button onClick={postData} type="primary">
              Update Sheet
            </Button>
          </Space>
        </>
      )}
    </div>
  );
};

export default AmazonPage;
