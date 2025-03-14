import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [workplaceFilter, setWorkplaceFilter] = useState('');
    const [workplaces, setWorkplaces] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data');
                if (!response.ok) {
                    throw new Error('Andmete laadimine ebaõnnestus');
                }
                const result = await response.json();
                setData(result);
                setFilteredData(result);

                // Unikaalsete töökohtade kogumine
                const allWorkplaces = new Set();
                result.forEach(item => {
                    const places = item['Töökoht, töökohad']?.split(',').map(place => place.trim()) || [];
                    places.forEach(place => allWorkplaces.add(place));
                });
                setWorkplaces(Array.from(allWorkplaces));
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();

        const filtered = data.filter((item) => {
            const matchesName = (
                item.Eesnimi?.toLowerCase().includes(lowerCaseQuery) ||
                item.Perekonnanimi?.toLowerCase().includes(lowerCaseQuery)
            );

            const workplaces = item['Töökoht, töökohad']?.split(',').map(w => w.trim()) || [];
            const matchesWorkplace = workplaceFilter ? workplaces.includes(workplaceFilter) : true;

            return matchesName && matchesWorkplace;
        });

        setFilteredData(filtered);
    }, [searchQuery, workplaceFilter, data]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Tsunftiga seotud meistrid</h1>

            <input
                type="text"
                placeholder="Otsi eesnime või perekonnanime järgi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
            />

            <select
                value={workplaceFilter}
                onChange={(e) => setWorkplaceFilter(e.target.value)}
                style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
            >
                <option value="">Kõik töökohad</option>
                {workplaces.map((place) => (
                    <option key={place} value={place}>{place}</option>
                ))}
            </select>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ddd' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Eesnimi</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Perekonnanimi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <Link href={`/meister/${index}`}>
                                    {item.Eesnimi}
                                </Link>
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.Perekonnanimi}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
