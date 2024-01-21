import React, {useState} from 'react';
import styles from './Dropdown.module.css';

interface MonthDropdownProps {
    onSelectMonth: (month: string) => void; // Callback function to handle client selection
}
const MonthsDropdown: React.FC<MonthDropdownProps> = ({ onSelectMonth }) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedMonth(selectedValue);
        onSelectMonth(selectedValue);

    };

    return (
        <select className={styles.dropdown} value={selectedMonth} onChange={handleDropdownChange}>
            <option value="" disabled>
                Select a Month
            </option>
            {months.map((month, index) => (
                <option key={index} value={index+1}>
                    {month}
                </option>
            ))}
        </select>
    );
};

export default MonthsDropdown;