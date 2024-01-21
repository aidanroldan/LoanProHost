import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import React, { useEffect, useState, useRef } from 'react';
import '../HomePage/HomePage.css';
import {useNavigate} from "react-router-dom";


function PayementsGrid({monthSelection, yearSelection}:any) {
    const [rowData, setRowData] = useState([]);
    const [updateCount, setUpdateCount] = useState(0);
    const navigate = useNavigate();

    const columnDefs: ColDef[] = [
        { field: 'LoanID', filter: true, width: 120 },
        { field: 'Name' },
        { field: 'PaymentDue', width: 160 },
        { field: 'DueDate' , filter: true, width: 140},
        { field: 'PaymentReceived', editable:true, width: 160 },
        { field: 'PaymentReceivedDate', editable:true, width: 180 },
        { field: 'PaymentStatus', editable:true, width: 135 },
    ];

    const gridRef = useRef<AgGridReact>(null);

    useEffect(() => {

        async function fetchData() {
            console.log(yearSelection)
            try {
                // Construct the API URL based on the selected client
                const apiUrl = `/api/get_upcoming_payments?month=${monthSelection}&year=${yearSelection}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                if (data && data.results) {
                    setRowData(data.results.map((item: any) => ({
                        LoanID: item.LoanId,
                        DueDate: item.PaymentDueDate,
                        PaymentDue: item.PaymentDueAmount,
                        PaymentReceived: item.PaymentRecAmount,
                        PaymentReceivedDate: item.PaymentRecDate,
                        PaymentStatus: Boolean(item.PaidStatus),
                        Name: item.ClientName,
                        PaymentId: item.PaymentId,
                        
                    })));
                }

                // Assuming mapApiResponseToGridFields is a valid function
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, [updateCount, monthSelection, yearSelection]);

    const updatePayment = async (event: any) => {
        try {
            const payid = event.data.PaymentId
            const updatedData = {
                PaymentRecAmount: parseFloat(event.data.PaymentReceived),
                PaymentRecDate: event.data.PaymentReceivedDate,
                PaymentDueAmount: event.data.PaymentDue,
                PaymentDueDate : event.data.DueDate,
                LoanId: event.data.LoanID,
                PaidStatus: event.data.PaymentStatus

            };
            const response = await fetch(`/api/update-payment?payment_id=${payid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            else if(response.ok){
                setUpdateCount(prevCount => prevCount + 1);
            }

            console.log('Record updated successfully');
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    async function onRowEdit(event:any) {
        updatePayment(event)
    }



    return (
        <div className="ag-theme-balham" style={{ width: '100%', height: '100%' }}>
            <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} onCellEditingStopped={onRowEdit}/>
        </div>
    );}

export default PayementsGrid;
