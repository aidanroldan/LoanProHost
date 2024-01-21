import React, { useState } from 'react';
import '../HomePage/HomePage.css';
import { useNavigate } from 'react-router-dom';
import InfoGrid from '../RecordInfoPage/InfoGrid';
import LoanShark from '../LoanShark.png';

function NewRecord() {
    const navigate = useNavigate();
  
    // This function is responsible for navigation
    const HomePagenav = () => {
      navigate('/');
    };
    
    const [formData, setFormData] = useState({
        name: "",
        maturitydate: "",
        issuedate: "",
        interestRate: "",
        paymentFrequency: 'Monthly',
        loanAmount: "",
        activeStatus: 'true'
    });

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Create the request body object with the form data
        const requestBody = {
            ClientName: formData.name,// Assuming the name format is "First Last"
            PaymentFrequency: formData.paymentFrequency,
            LoanMaturity: formData.maturitydate,
            IssueDate: formData.issuedate,
            LoanAmount: parseFloat(formData.loanAmount),
            InterestRate: parseFloat(formData.interestRate),
            ActiveStatus: formData.activeStatus === "true", // Adjust as needed
        };

        try {
            console.log(requestBody)
            // Send a POST request with the request body
            const response = await fetch('/api/new-loan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Handle success here, e.g., show a success message or redirect
                console.log('Record created successfully');
                navigate('/')
            } else {
                // Handle errors here, e.g., show an error message
                console.error('Error creating record:', response.status);
            }
        } catch (error) {
            console.error('Error creating record:', error);
        }
    };

    return (
        <div>
        <div className="sharkcage">
        <img src={LoanShark} alt="Loan Shark" />
        </div>
        
   
        <div className="container2">
            <button onClick={HomePagenav}>Back</button>
            <h1 className="title">New Loan</h1>
            <form onSubmit={handleSubmit}>
                

               

                
            

                <div className="form-group">
                    <label htmlFor="name">Name  </label>
                    <input
                        type="text"
                        id="name"
                        placeholder=""
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Loan Issue Date  </label>
                    <input
                        type="date"
                        id="date"
                        name="issuedate"
                        value={formData.issuedate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Loan Maturity Date  </label>
                    <input
                        type="date"
                        id="date"
                        name="maturitydate"
                        value={formData.maturitydate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="loanAmount">Loan Amount  </label>
                    <input
                        type="number"
                        id="loanAmount"
                        placeholder="loanAmount"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="interestRate">Interest Rate  </label>
                    <input
                        type="number"
                        id="interestRate"
                        placeholder="interestRate"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                <label htmlFor="paymentFrequency">Payment Frequency </label>
                <select
                id="paymentFrequency"
                name="paymentFrequency"
                value={formData.paymentFrequency}
                onChange={handleChange}
                required
                >
                <option value="Monthly">Monthly  </option>
                <option value="Quarterly">Quarterly  </option>
                <option value="Annually">Annually</option>
                </select>
            </div>

                <div className="form-group">
                <label htmlFor="activeStatus">Active Status </label>
                <select
                id="activeStatus"
                name="activeStatus"
                value={formData.activeStatus}
                onChange={handleChange}
                required
                >
                <option value="true">Yes</option>
                <option value="false">No</option>
                </select>
            </div>

                <button type="submit">Submit</button>
            </form>
        </div>
        </div>
    );
}

export default NewRecord;
