import React, {useEffect, useState, useRef, useImperativeHandle, forwardRef} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from "ag-grid-community";
import { useNavigate } from 'react-router-dom';
import '../HomePage/HomePage.css';
const InfoGrid = ({loanRecord}:any) => {
    const [rowData, setRowData] = useState<any>([]);
    const [updateCount, setUpdateCount] = useState(0);

    const columnDefs: ColDef[] = [
        { field: 'PaymentDue', editable:true },
        { field: 'PaymentDueDate' , editable:true},
        { field: 'PaymentReceived' , editable:true},
        { field: 'PaymentReceivedDate' , editable:true},
        { field: 'PaymentStatus', editable:true, width: 135 },
        
    ];

    const gridRef = useRef<AgGridReact>(null);
    const navigate = useNavigate();



    // Expose addNewRow function to parent via ref


    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch(`/api/search-payments-by-loan-id?loan_id=${loanRecord.LoanId || 1}`);
                const data = await response.json();
                if (data && data.results) {
                    const sortedPayments = data.results.sort((a: any, b: any) => {
                        // Convert dates to Date objects for comparison
                        const dateA = new Date(a.PaymentDueDate);
                        const dateB = new Date(b.PaymentDueDate);
                        return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
                    });
                    setRowData(sortedPayments.map((payment: any) => ({
                        PaymentDue: payment.PaymentDueAmount,
                        PaymentDueDate: payment.PaymentDueDate,
                        PaymentReceived: payment.PaymentRecAmount,
                        PaymentReceivedDate: payment.PaymentRecDate,
                        PaymentId: payment.PaymentId,
                        PaymentStatus: Boolean(payment.PaidStatus),
                    })));
                }
            } catch (error) {
                console.error('Error fetching payment data:', error);
            }
        };

        fetchPayments();
    }, [loanRecord, updateCount]);

    async function onRowEdit(event:any) {
        updatePayment(event)

    }

    const updatePayment = async (event: any) => {
        try {
            const payid = event.data.PaymentId
            const updatedData = {
                PaymentRecAmount: event.data.PaymentReceived,
                PaymentRecDate: event.data.PaymentReceivedDate,
                PaymentDueAmount: event.data.PaymentDue,
                PaymentDueDate : event.data.PaymentDueDate,
                LoanId: loanRecord.LoanId,
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

    return (
        <div className='ag-theme-balham' style={{ width: '100%', height: '100%' }}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                onCellEditingStopped={onRowEdit}
            />
        </div>
    );
}

export default InfoGrid;
