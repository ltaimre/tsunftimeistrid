
import React from 'react';

const DataTable = ({ data }) => {
    if (!data || data.length === 0) return <p>Andmed puuduvad.</p>;

    const headers = Object.keys(data[0]);

    return (
        <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ddd' }}>
            <thead>
                <tr>
                    {headers.map(header => (
                        <th key={header} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {headers.map(header => (
                            <td key={header} style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {row[header]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;
