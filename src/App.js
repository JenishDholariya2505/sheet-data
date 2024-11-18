import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";
import { Table } from "antd";

const API_KEY = "AIzaSyAA31LB23nmwF0DEt6DlcGJip139lBh4to";
const SHEET_ID = "1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs"; // Replace with your Google Sheet ID

const RANGE = "Sheet1!A2:B2"; // The range to update (adjust as needed)

const CLIENT_ID =
  "22887924268-2fi8h5n7h6rb24dmr8uf8a04lm7qfl20.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://www.googleapis.com/oauth2/v1/certs";
const REFRESH_TOKEN =
  "1//0gErosxb-dZ_7CgYIARAAGBASNwF-L9Irb4fzdlkwjO6BAUF5ZVoNYz70vXl8ocWHdcdtiV4Ub6Jo2kx0TsN4zECMrCDDUaaIk8U";

function App() {
  const [sheetData, setSheetData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sheetData_, setSheetData_] = useState([]);
  const convertData = (data) => {
    // Map column headers for easy access
    const headers = data.cols.map((col) => col.label);

    // Convert rows into a structured array of objects
    const transformedData = data.rows.map((row) => {
      const rowData = {};
      row.c.forEach((cell, index) => {
        const header = headers[index];
        // Only add columns with a label
        if (header) {
          rowData[header] = cell ? cell.v : null;
        }
      });
      return rowData;
    });

    return transformedData;
  };
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const spreadsheetId = "1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs";
        const sheetName = "Extension Sheet";

        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`
        );
        const data = await response.text();

        const jsonData = JSON.parse(data.substring(47, data.length - 2));
        setSheetData(convertData(jsonData.table));
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      }
    };

    fetchSheetData();
  }, []);

  const columns = [
    {
      title: "ASIN",
      dataIndex: "ASIN",
      key: "ASIN",
    },
    {
      title: "Title",
      dataIndex: "TITLE",
      key: "TITLE",
      width: 200,
    },
    {
      title: "Price",
      dataIndex: "Price",
      key: "Price",
      render: (text) => (text !== null ? `$${text}` : "-"),
    },
    {
      title: "Brand Name",
      dataIndex: "BrandName",
      key: "BrandName",
    },
    {
      title: "FBA Inventory",
      dataIndex: "FBA_inventory",
      key: "FBA_inventory",
      render: (text) => (text !== null ? text : "-"),
    },
    {
      title: "Action",

      render: (text) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.open(`https://www.amazon.com/dp/${text?.ASIN}`);
          }}
        >
          <svg
            fill="#000000"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="30px"
            height="30px"
            viewBox="0 0 35.418 35.418"
            xmlSpace="preserve"
          >
            <g>
              <path
                d="M20.948,9.891c-0.857,0.068-1.847,0.136-2.837,0.269c-1.516,0.195-3.032,0.461-4.284,1.053
		c-2.439,0.994-4.088,3.105-4.088,6.209c0,3.898,2.506,5.875,5.669,5.875c1.057,0,1.913-0.129,2.703-0.328
		c1.255-0.396,2.31-1.123,3.562-2.441c0.727,0.99,0.923,1.453,2.177,2.509c0.329,0.133,0.658,0.133,0.922-0.066
		c0.791-0.659,2.174-1.848,2.901-2.508c0.328-0.267,0.263-0.66,0.066-0.992c-0.727-0.924-1.45-1.718-1.45-3.498v-5.943
		c0-2.513,0.195-4.822-1.647-6.537c-1.518-1.391-3.891-1.916-5.735-1.916c-0.264,0-0.527,0-0.792,0
		c-3.362,0.197-6.921,1.647-7.714,5.811c-0.13,0.525,0.267,0.726,0.53,0.793l3.691,0.464c0.396-0.07,0.593-0.398,0.658-0.73
		c0.333-1.449,1.518-2.176,2.836-2.309c0.067,0,0.133,0,0.265,0c0.79,0,1.646,0.332,2.109,0.987
		c0.523,0.795,0.461,1.853,0.461,2.775L20.948,9.891L20.948,9.891z M20.223,17.749c-0.461,0.925-1.253,1.519-2.11,1.718
		c-0.131,0-0.327,0.068-0.526,0.068c-1.45,0-2.31-1.123-2.31-2.775c0-2.11,1.254-3.104,2.836-3.565
		c0.857-0.197,1.847-0.265,2.836-0.265v0.793C20.948,15.243,21.01,16.43,20.223,17.749z M35.418,26.918v0.215
		c-0.035,1.291-0.716,3.768-2.328,5.131c-0.322,0.25-0.645,0.107-0.503-0.254c0.469-1.145,1.541-3.803,1.04-4.412
		c-0.355-0.465-1.826-0.43-3.079-0.322c-0.572,0.072-1.075,0.105-1.469,0.183c-0.357,0.033-0.431-0.287-0.071-0.537
		c0.466-0.323,0.969-0.573,1.541-0.756c2.039-0.608,4.406-0.25,4.729,0.146C35.348,26.414,35.418,26.629,35.418,26.918z
		 M32.016,29.428c-0.466,0.357-0.965,0.682-1.468,0.973c-3.761,2.261-8.631,3.441-12.856,3.441c-6.807,0-12.895-2.512-17.514-6.709
		c-0.396-0.324-0.073-0.789,0.393-0.539C5.549,29.5,11.709,31.26,18.084,31.26c4.013,0,8.342-0.754,12.463-2.371
		c0.285-0.104,0.608-0.252,0.895-0.356C32.087,28.242,32.661,28.965,32.016,29.428z"
              />
            </g>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div
      className="App"
      style={{
        width: "700px",
        height: "500px",
      }}
    >
      <Table
        columns={columns}
        scroll={{ x: "max-content" }}
        dataSource={sheetData}
        pagination={false}
      />
    </div>
  );
}

export default App;
