
import { fetchData } from '../../utils/fetchData';

export default async function handler(req, res) {
    try {
        const data = await fetchData();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Andmete laadimine ebaõnnestus' });
    }
}
