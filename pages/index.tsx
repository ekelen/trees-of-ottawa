import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PropsWithoutRef, useCallback, useEffect, useState } from "react";

const LeafletComponent = dynamic(() => import("../components/Leaflet"), {
  ssr: false,
});
import styles from "../styles/Home.module.css";

type Envelope = [[lon0: number, lat0: number], [lon1: number, lat1: number]];

const Results = ({
  trees,
  envelope,
  center,
}: {
  trees: Array<any>;
  envelope: Envelope;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [center, setCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [envelope, setEnvelope] = useState<Envelope | null>(null);

  const [trees, setTrees] = useState<any>([]);

  const createEnvelope = (center: {
    latitude: number;
    longitude: number;
  }): Envelope => {
    // 0.001 is ~110m
    return [
      [center.longitude - 0.001, center.latitude - 0.001],
      [center.longitude + 0.001, center.latitude + 0.001],
    ];
  };

  useEffect(() => {
    if (center) {
      const envelope = createEnvelope(center);
      setEnvelope(envelope);
    }
  }, [center]);
  useEffect(() => {
    if (envelope) {
      setLoading(true);
      setTrees(null);
      setErrorMessage("");
      fetch(`./api/get-trees?envelope=${JSON.stringify(envelope)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.features?.length) {
            setTrees(json.features);
          } else {
            setErrorMessage(`No trees found near that location. ☹️
            
            Try another address closer to the city centre!`);
          }
        })
        .catch((error) => {
          setErrorMessage(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [envelope]);
  return (
    <>
      <ul>
        {props.results.map((res, i) => (
          <li key={`${res.label}-${i}`} style={{ listStyle: "none" }}>
            <button
              onClick={() => {
                setLabel(res.label);
                setCenter({ latitude: res.latitude, longitude: res.longitude });
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
      {trees?.length && envelope && center ? (
        <Results trees={trees} envelope={envelope} center={center} />
      ) : loading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p>{errorMessage}</p>
      ) : null}
    </>
  );
};

const Search = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formattedResults, setFormattedResults] = useState<any>(null);
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
    const body = JSON.stringify(object);
    fetch("./api/get-coordinates", {
      body,
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
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <input
          type={"text"}
          name="query"
          placeholder="Museum of Nature"
          required
        />
        <button>Submit</button>
      </form>
      {formattedResults ? (
        <Addresses results={formattedResults} />
      ) : errorMessage ? (
        <p>{errorMessage}</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : null}
    </>
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
          <Image
            src="/android-chrome-512x512.png"
            height="2rem"
            width="2rem"
            alt="tree"
          />
          Trees of Ottawa
          <Image
            src="/android-chrome-512x512.png"
            height="2rem"
            width="2rem"
            alt="tree"
          />
        </h1>

        <p className={styles.description}>
          Enter a <strong>street address in Ottawa</strong> to see trees nearby:
        </p>
        <Search />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/ekelen/trees-of-ottawa"
          target="_blank"
          rel="noopener noreferrer"
        >
          by{" "}
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
