import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import React, { useEffect, useState, useRef } from 'react';
import './HomePage.css';
import {useNavigate} from "react-router-dom";

function HomeGrid({selectedClient} : any) { // Accept selectedClient as a prop
    const [rowData, setRowData] = useState([]);
    const navigate = useNavigate();

    const columnDefs: ColDef[] = [
        { field: 'LoanID', filter: true },
        { field: 'Name', width: 275 },
        { field: 'Principal', width: 200 },
        { field: 'Due' , filter: true, width: 170},
        { field: 'Issued', filter: true, width: 170},
        { field: 'Status', editable:true, width: 80 },
    ];

    const gridRef = useRef<AgGridReact>(null);
    const onRowClicked = (event: any) => {
        const loanId = event.data.LoanID;
        // Perform navigation using your preferred method
        // For example, using window.location for redirection
        navigate(`/recordInfo?loanId=${loanId}`);
    };

    // Define a mapping function to map API response fields to grid fields
    const mapApiResponseToGridFields = (apiData: any) => {
        return apiData.map((item : any) => ({
            LoanID: item.LoanId,
            Due: item.LoanMaturity,
            Issued: item.IssueDate,
            Status: Boolean(item.ActiveStatus),
            Name: item.ClientName,
            Principal: item.LoanAmount
        }));
    };

    useEffect(() => {
        async function fetchData() {
            try {
                // Construct the API URL based on the selected client
                const apiUrl = `/api/search-by-client-id?client_id=${selectedClient}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const apiData = await response.json();
                const gridData = mapApiResponseToGridFields(apiData.results);
                setRowData(gridData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, [selectedClient]); // Listen for changes in selectedClient

    const activeStatus = async (event: any) => {
        try {
            const loanid = event.data.LoanID
            const updatedData = {
                    ActiveStatus: event.data.Status
                    // Include other fields if necessary
            };
            const response = await fetch(`/api/active-status?loan_id=${loanid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('Record updated successfully');
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    return (
        <div className="ag-theme-balham" style={{ width: '100%', height: '100%' }}>
            <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} onRowClicked={onRowClicked} onCellEditingStopped={activeStatus}/>
        </div>
    );
}

export default HomeGrid;
