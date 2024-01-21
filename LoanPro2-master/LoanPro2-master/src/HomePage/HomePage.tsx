import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import HomeGrid from "./HomeGrid";
import ClientDropdown from "./ClientDropdown";
import LoanShark from '../LoanShark.png';

function HomePage() {
    const navigate = useNavigate();
    const [selectedClient, setSelectedClient] = useState("*"); // State to store the selected client

    // This function is responsible for navigation to the NewRecord page
    const NewRecordnav = () => {
        navigate('/NewRecord');
    };
    const UpcomingPaymentsNav = () => {
        navigate('/UpcomingPayments');
    };

    const HelpNav = () => {
        navigate('/Help');
    };

    // Function to handle the selection change in the ClientDropdown
    const handleClientSelection = (selectedValue: any) => {
        setSelectedClient(selectedValue); // Update the selected client in state
    };

    return (
        <div>
            <div className={"top-left-button"}>
                
                <button onClick={NewRecordnav}>New Loan</button>
                <button onClick={UpcomingPaymentsNav}>Upcoming Payments</button> <div className={"helpSpacer"}>  <button onClick={HelpNav}>Help</button>
                    
               
                </div>
            </div>
            <div>
                <h1>LMS - Loan Managment System
    </h1>
            </div>
            <div
                className={"searchContainer"}>
                <ClientDropdown onSelectClient={handleClientSelection}/>
            </div>
            <div className="recordContainer">
                {/* Pass the selectedClient as a prop to the HomeGrid component */}
                <HomeGrid selectedClient={selectedClient}/>
            </div>
        </div>
    );
}

export default HomePage;
