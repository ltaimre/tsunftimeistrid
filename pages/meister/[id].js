import { fetchData } from '../../utils/fetchData';

export async function getStaticPaths() {
    const data = await fetchData();

    const paths = data.map((_, index) => ({
        params: { id: index.toString() }
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const data = await fetchData();
    const meister = data[params.id];

    return {
        props: { meister }
    };
}

export default function MeisterDetail({ meister }) {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>{meister.Eesnimi} {meister.Perekonnanimi}</h1>
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ddd' }}>
                <tbody>
                    {Object.entries(meister).map(([key, value]) => (
                        <tr key={key}>
                            <td style={{ fontWeight: 'bold', border: '1px solid #ddd', padding: '8px' }}>{key}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
