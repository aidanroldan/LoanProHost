import '../HomePage/HomePage.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import LoanShark from '../LoanShark.png';
import PayementsGrid from './PaymentsGrid';
import MonthsDropdown from './MonthDropdown';
import YearDropdown from './YearDropdown';

function UpcomingPayments() {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");// State to store the selected client

    // This function is responsible for navigation to the HomePage page
    const HomePagenav = () => {
        navigate('/');
    };


    function handleMonthSelection(selectedValue: any) {
        setSelectedMonth(selectedValue);
    }

    function handleYearSelection(selectedValue: any) {
        setSelectedYear(selectedValue);

    }

    return (
        <div>
            <div className={"top-left-button"}>
                {/* Use the HomePagenav function here for navigation */}
                <button onClick={HomePagenav}>Back</button>
            </div>
            <div>
                <h1>Payments Due
                    <img src={LoanShark} alt="Loan Shark"/>
                </h1>
            </div>

            <div>
            
            <h5><MonthsDropdown onSelectMonth={handleMonthSelection} />           <YearDropdown onSelectYear={handleYearSelection}/></h5>
        </div>
            

            <div className="recordContainer">
                
                <PayementsGrid monthSelection={selectedMonth} yearSelection={selectedYear}/>
            </div>
        </div>
    );
}

export default UpcomingPayments;
