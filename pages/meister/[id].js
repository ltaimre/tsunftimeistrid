import { fetchData } from "../../utils/fetchData";

export async function getStaticPaths() {
  const data = await fetchData();

  const paths = data.map((_, index) => ({
    params: { id: index.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const data = await fetchData();
  const meister = data[params.id];

  return {
    props: { meister },
  };
}

export default function MeisterDetail({ meister }) {
  return (
    <div className="meister-detail">
      <h1>
        {meister.Eesnimi} {meister.Perekonnanimi}
      </h1>

      <table className="meister-table">
        <tbody>
          {Object.entries(meister).map(([key, value]) => (
            <tr key={key}>
              <td className="label">{key}</td>
              <td>
                {value?.includes(",") ? (
                  <ul>
                    {value.split(",").map((part, idx) => (
                      <li key={idx}>{part.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
