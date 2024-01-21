import React, {useState} from 'react';
import styles from './Dropdown.module.css';

interface YearDropdownProps {
    onSelectYear: (year: string) => void; // Callback function to handle client selection
}
const YearDropdown: React.FC<YearDropdownProps> = ({ onSelectYear }) => {
    const years = ["2024", "2025", "2026", "2027", "2028", "2029",
                    "2030", "2031", "2032", "2033", "2034"];
    const [selectedYear, setSelectedYear] = useState<string>('');
    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedYear(selectedValue);
        onSelectYear(selectedValue);

    };

    return (
        <select className={styles.dropdown} value={selectedYear} onChange={handleDropdownChange}>
            <option value="" disabled>
                Select a Year
            </option>
            {years.map((year, index) => (
                <option key={index} value={year}>
                    {year}
                </option>
            ))}
        </select>
    );
};

export default YearDropdown;