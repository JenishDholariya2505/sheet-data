import React, { useState, useEffect } from "react";
import { getSheetData } from "./GoogleSheetsAPI";

const GoogleSheetsViewer = () => {
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    const fetchSheetData = async () => {
      const data = await getSheetData(
        "1c3c9Z9EHxbTzqQk-wrqCWq-52xREkJG-xRToX8BepIs",
        "Extension Sheet!A1:B10"
      );
      setSheetData(data);
    };
    fetchSheetData();
  }, []);

  return (
    <div>
      <h2>Google Sheets Data</h2>
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
          </tr>
        </thead>
        <tbody>
          {sheetData.map((row, index) => (
            <tr key={index}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoogleSheetsViewer;
