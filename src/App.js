import React, { useEffect, useState } from "react";
import "./App.css";
import { Col, Divider, Empty, Row, Spin, Tag, Typography } from "antd";
import { Icon } from "@iconify/react/dist/iconify.js";
import AmazonPage from "./amazon";
import GoogleSheetPage from "./google-sheet";

function App() {
  const [urlData, setUrlData] = useState({
    type: "google_sheets",
    details: {
      sheetId: "1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs",
      gid: "0",
      isValid: true,
      fullUrl:
        "https://docs.google.com/spreadsheets/d/1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs/edit?gid=0#gid=0",
      apiEndpoint:
        "https://sheets.googleapis.com/v4/spreadsheets/1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs",
      shareableUrl:
        "https://docs.google.com/spreadsheets/d/1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs/edit?usp=sharing",
    },
  });
  const [loading, setLoading] = useState(false);

  const identifyURL = (url) => {
    try {
      // Create URL object for parsing
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Extract different parts of URL
      const urlParts = {
        protocol: urlObj.protocol,
        hostname: hostname,
        pathname: urlObj.pathname,
        searchParams: urlObj.searchParams,
        hash: urlObj.hash,
      };

      // Check for Google Sheets
      if (
        hostname.includes("docs.google.com") &&
        urlParts.pathname.includes("/spreadsheets/d/")
      ) {
        // Extract sheet ID and other details
        const pathParts = urlParts.pathname.split("/");
        const sheetId = pathParts[pathParts.indexOf("d") + 1];
        const gid =
          urlParts.hash.replace("#gid=", "") ||
          urlParts.searchParams.get("gid") ||
          "0";

        return {
          type: "google_sheets",
          details: {
            sheetId: sheetId,
            gid: gid,
            isValid: sheetId.length > 0,
            fullUrl: url,
            apiEndpoint: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
            shareableUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`,
          },
        };
      }

      // Check for Amazon
      else if (hostname.includes("amazon.")) {
        // Extract ASIN if present
        const asinMatch = urlParts.pathname.match(
          /\/([A-Z0-9]{10})(?:\/|\?|$)/
        );
        const asin = asinMatch ? asinMatch[1] : null;

        return {
          type: "amazon",
          details: {
            asin: asin,
            marketplace: hostname,
            isValid: Boolean(asin),
            fullUrl: url,
            cleanUrl: asin ? `https://${hostname}/dp/${asin}` : url,
          },
        };
      }

      // Handle other common sites
      else {
        const siteTypes = {
          "github.com": "github",
          "gitlab.com": "gitlab",
          "bitbucket.org": "bitbucket",
          "youtube.com": "youtube",
          "youtu.be": "youtube",
          "facebook.com": "facebook",
          "twitter.com": "twitter",
          "linkedin.com": "linkedin",
          "instagram.com": "instagram",
        };

        const siteType = Object.entries(siteTypes).find(([domain]) =>
          hostname.includes(domain)
        );

        return {
          type: siteType ? siteType[1] : "unknown",
          details: {
            hostname: hostname,
            fullUrl: url,
            urlParts: urlParts,
          },
        };
      }
    } catch (error) {
      return {
        type: "invalid",
        error: error.message,
        details: {
          originalUrl: url,
        },
      };
    }
  };

  const getDomDetails = () => {
    chrome.runtime.sendMessage("get_dom", (response) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        setUrlData(null);
      } else {
        setUrlData(identifyURL(response?.url));
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    // getDomDetails();
    identifyURL(urlData?.details?.fullUrl);
    return () => {};
  }, []);

  const checkPageStatus =
    urlData?.type === "amazon" || urlData?.type === "google_sheets";

  return (
    <div
      className="App"
      style={{
        width: "700px",
        height: "500px",
      }}
    >
      <Spin spinning={loading}>
        {checkPageStatus ? (
          <>
            <Row align={"middle"} justify="start">
              <Col
                style={{ display: "flex", alignItems: "center" }}
                flex={"none"}
              >
                <Icon
                  width={24}
                  style={{ marginRight: "10px" }}
                  icon={
                    urlData?.type === "amazon"
                      ? "ri:amazon-fill"
                      : urlData?.type === "google_sheets"
                      ? "ri:google-fill"
                      : ""
                  }
                />
                <Tag
                  color={
                    urlData?.type === "amazon"
                      ? "green-inverse"
                      : "blue-inverse"
                  }
                >
                  {urlData?.type || "-"}
                </Tag>
              </Col>
            </Row>
            <Divider style={{ margin: "10px 0" }} />
            {urlData?.type === "amazon" ? (
              <AmazonPage {...urlData} />
            ) : (
              <GoogleSheetPage {...urlData} />
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "500px",
            }}
          >
            <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{ height: 60 }}
              description={
                <Typography.Text>
                  Support only Google Sheet and Amazon
                </Typography.Text>
              }
            ></Empty>
          </div>
        )}
      </Spin>
    </div>
  );
}

export default App;
