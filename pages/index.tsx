import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PropsWithoutRef, useCallback, useEffect, useState } from "react";

const LeafletComponent = dynamic(() => import("../components/Leaflet"), {
  ssr: false,
});
import styles from "../styles/Home.module.css";

const Results = ({
  trees,
  envelope,
  center,
}: {
  trees: Array<any>;
  envelope: { lat: [number, number]; lon: [number, number] };
  center: { latitude: number; longitude: number };
}) => {
  return (
    <div>
      <p>{trees.length} trees found within ~250m of your address!</p>
      <LeafletComponent center={center} envelope={envelope} trees={trees} />
    </div>
  );
};

const Addresses = (
  props: PropsWithoutRef<{
    results: Array<{ latitude: number; longitude: number; label: string }>;
  }> = { results: [] }
) => {
  const [label, setLabel] = useState<string>("");
  const [latlon, setLatLon] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [envelope, setEnvelope] = useState<{
    lat: [number, number];
    lon: [number, number];
  } | null>(null);
  const [query, setQuery] = useState<string>("");
  const [trees, setTrees] = useState<any>({});
  const createEnvelope = (latlon: {
    latitude: number;
    longitude: number;
  }): { lat: [number, number]; lon: [number, number] } => {
    const lat: [number, number] = [
      latlon.latitude - 0.001,
      latlon.latitude + 0.001,
    ];
    const lon: [number, number] = [
      latlon.longitude - 0.001,
      latlon.longitude + 0.001,
    ];
    return { lat, lon };
  };
  const createQuery = ({
    lat,
    lon,
  }: {
    lat: [number, number];
    lon: [number, number];
  }): string => {
    const str: string = `${lon[0]}%2C${lat[0]}%2C${lon[1]}%2C${lat[1]}`;
    const query: string = `https://maps.ottawa.ca/arcgis/rest/services/Forestry/MapServer/0/query?where=1%3D1&outFields=*&geometry=${str}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelContains&outSR=4326&f=json`;
    return query;
  };
  useEffect(() => {
    if (latlon) {
      const envelope = createEnvelope(latlon);
      const query = createQuery(envelope);
      setEnvelope(envelope);
      setQuery(query);
    }
  }, [latlon]);
  useEffect(() => {
    if (query) {
      fetch(query)
        .then((res) => res.json())
        .then((json) => {
          if (json.features && json.features.length) {
            setTrees(json.features);
          }
        });
    }
  }, [query]);
  return (
    <div>
      <ul>
        {props.results.map((res, i) => (
          <li key={`${res.label}-${i}`} style={{ listStyle: "none" }}>
            <button
              onClick={() => {
                setLabel(res.label);
                setLatLon({ latitude: res.latitude, longitude: res.longitude });
              }}
            >
              <span
                style={{ fontWeight: res.label === label ? "bold" : undefined }}
              >
                {res.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {trees?.length && envelope && latlon && (
        <Results trees={trees} envelope={envelope} center={latlon} />
      )}
    </div>
  );
};

const Search = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formattedResults, setFormattedResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (results) {
      if (results.length) {
        const formatted = results.map((res: any) => ({
          latitude: res.latitude,
          longitude: res.longitude,
          label: res.label,
        }));
        setFormattedResults(formatted);
      } else {
        setErrorMessage("No address found. ☹️");
      }
    } else {
      setFormattedResults(null);
    }
  }, [results]);
  const onSubmit = useCallback((e: any) => {
    setResults(null);
    setErrorMessage("");
    setLoading(true);
    const formData = new FormData(e.target);
    const object: any = {};
    formData.forEach(function (value, key) {
      object[key] = value;
    });
    var json = JSON.stringify(object);
    fetch("./api/get-coordinates", {
      body: json,
      method: "POST",
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <input
          type={"text"}
          name="query"
          placeholder="240 McLeod St"
          required
        />
        <button>Submit</button>
      </form>
      {formattedResults && <Addresses results={formattedResults} />}
      {errorMessage && <p>{errorMessage}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Trees of Ottawa</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <img src="/android-chrome-512x512.png" style={{ height: "2rem" }} />
          Trees of Ottawa
          <img src="/android-chrome-512x512.png" style={{ height: "2rem" }} />
        </h1>

        <p className={styles.description}>
          Enter a <strong>street address in Ottawa</strong> to see trees nearby:
          <Search />
        </p>
      </main>

      <footer className={styles.footer}>
        {/* Cafe washroom code 0421 is now committed */}
        <a
          href="https://github.com/ekelen/trees-of-ottawa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built by{" "}
          <span className={styles.ghlogo}>
            <Image src="/github.svg" alt="GitHub Logo" width={16} height={16} />
          </span>{" "}
          @ekelen
        </a>
      </footer>
    </div>
  );
};

export default Home;
