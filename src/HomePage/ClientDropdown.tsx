import React, { useState, useEffect } from 'react';

interface ClientDropdownProps {
    onSelectClient: (clientId: string) => void; // Callback function to handle client selection
}

const ClientDropdown: React.FC<ClientDropdownProps> = ({ onSelectClient }) => {
    const [clients, setClients] = useState<{ id: string, fullName: string }[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const mapApiResponseToFields = (apiData: any) => {
        return apiData.results.map((item: any) => ({
            id: item.ClientId,
            fullName: item.ClientName
        }));
    };

    useEffect(() => {
        fetch('/api/clients')
            .then(response => response.json())
            .then(data => {
                const mappedData = mapApiResponseToFields(data);
                setClients(mappedData);
            })
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    // Handle dropdown change and call the onSelectClient callback
    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        setSelectedClientId(selectedValue);
        onSelectClient(selectedValue); // Call the callback with the selected client ID
    };

    return (
        <div>
            <select value={selectedClientId} onChange={handleDropdownChange}>
                <option value="*">--ALL--</option> {/* Add the initial "All" option */}
                {clients.map((client, index) => (
                    <option key={index} value={client.id}>{client.fullName}</option>
                ))}
            </select>
        </div>
    );
};

export default ClientDropdown;
