import '../HomePage/HomePage.css';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import InfoGrid from './InfoGrid';
import LoanShark from '../LoanShark.png';
import {useEffect, useRef, useState} from "react";

function RecordInfo() {
    const location = useLocation(); // Use useParams hook here
    const queryParams = new URLSearchParams(location.search);
    const loanId = queryParams.get('loanId');// Access loanId from params
    const infoGridRef:any = useRef(null); // Create a ref for InfoGrid

    console.log(loanId)
    const [loanInfo, setLoanInfo] = useState<any>({
        ClientName: "NULL",
        LoanId: loanId
    });


    const navigate = useNavigate();




    useEffect(() => {
        async function fetchData() {
            try {
                // Construct the API URL based on the selected client
                const apiUrl = `/api/search-by-loan-id?loan_id=${loanId}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const apiData = await response.json();
                if (apiData.results && apiData.results.length > 0) {
                    setLoanInfo(apiData.results[0]);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, [loanId]);

    // Navigation function to go back to the home page
    const navigateToHomePage = () => {
        navigate('/');
    };


    return (
        <div className="header-container">
            
            <div className="top-middle-button3">
            <button onClick={navigateToHomePage}>Back</button>
                <div className="sharkspacer"> <img src={LoanShark} alt="Loan Shark" />
                
                </div>
            </div>
        
       
           
        
        <div className="main-container">
            <div className="left-side-bar">
                <h1>Loan ID: {loanId || "Loading..."}</h1>
                <h3>{loanInfo.ClientName || "Loading..."}</h3>
                <h3>Principal: ${loanInfo.LoanAmount}
                </h3>
                <h3>Interest Rate: {loanInfo.InterestRate}%</h3>
                <h3>Issue Date: {loanInfo.IssueDate}</h3>
                <h3>Maturity: {loanInfo.LoanMaturity}</h3>
                
                
                <h3>Payment Frequency: {loanInfo.PaymentFrequency}</h3>
            </div>
            <div className="recordContainer4">
                <InfoGrid
                loanRecord={loanInfo}/>
            </div>
        </div>
    </div>
    );
}

export default RecordInfo;
