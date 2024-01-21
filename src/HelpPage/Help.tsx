import '../HomePage/HomePage.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import HomeGrid from "../HomePage/HomeGrid";
import ClientDropdown from "../HomePage/ClientDropdown";
import LoanShark from '../LoanShark.png';
import PayementsGrid from '../UpcomingPaymentsPage/PaymentsGrid';
 

function Help() {
    const navigate = useNavigate();
   
    const HomePagenav = () => {
        navigate('/');
    };
   

    return (
        <div>
            <div className={"top-left-button"}>
                {/* Use the HomePagenav function here for navigation */}
                <button onClick={HomePagenav}>Back</button>
            </div>
            <div>
                <h1>
                    <img src={LoanShark} alt="Loan Shark"/>
                </h1>
            </div>
            {/* <div
                className={"searchContainer"}>
                <ClientDropdown onSelectClient={handleClientSelection}/>
            </div> */}
            <div className="recordContainer">
                <h1> Hello User, Welcome to Loan Managment System™</h1>
                <h3>Home Page will show you every loan you have ever entered, active or not. You can click on the column headers to sort or filter any field that you desire. Click on any loan to get payment history of that specific loan, with details on the left. </h3>
               <h3>New Loan page allows you enter loanee information, then hit submit to create a new entry. These entries are stored on the cloud and instantly added to your homepage.</h3>
               <h3>Upcoming Payments will show you every auto generated interest payment. These Payments are auto generated when the loan is created. Also every time an interest payment is received in full, it will dissapear from the upcoming payments page, and a new payment will appear based on your selected payment frequency. Your payments which have been received are still accessible from the record info page for that specific loan.</h3>
               <h4>For assistance, call or text 516-946-1116 or 516-680-5367</h4>
            </div>
        </div>
    );
}

export default Help;
