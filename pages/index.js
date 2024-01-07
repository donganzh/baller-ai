import { useState } from "react";
import Head from "next/head";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [firstPrediction, setFirstPrediction] = useState(null);
  const [secondPrediction, setSecondPrediction] = useState(null);
  const [secondPrompt, setSecondPrompt] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirstPrediction(null);
    setSecondPrediction(null);
    setSecondPrompt("");
    setError(null);

    const userPrompt =
      e.target.prompt.value + " Is this related to circular economy?";

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
      }),
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    setFirstPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const updatedResponse = await fetch("/api/predictions/" + prediction.id);
      if (updatedResponse.status !== 200) {
        const errorPrediction = await updatedResponse.json();
        setError(errorPrediction.detail);
        return;
      }
      prediction = await updatedResponse.json();
      setFirstPrediction(prediction);
    }
  };

  const handleSecondSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const userPrompt =
      secondPrompt +
      " Rate this solution from Innovation and Originality, Environmental Impact, Market Potential, Economic Viability, Execution Feasibility, and Thoroughness.";

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
      }),
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    setSecondPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const updatedResponse = await fetch("/api/predictions/" + prediction.id);
      if (updatedResponse.status !== 200) {
        const errorPrediction = await updatedResponse.json();
        setError(errorPrediction.detail);
        return;
      }
      prediction = await updatedResponse.json();
      setSecondPrediction(prediction);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <Head>
        <title>Replicate + Next.js</title>
      </Head>

      <h1 className="py-6 text-center font-bold text-2xl">
        EcoValuator AI Tool
      </h1>

      {/* First Input Form */}
      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow"
          name="prompt"
          placeholder="Enter the problem"
        />
        <button className="button" type="submit">
          Check
        </button>
      </form>

      {error && <div>{error}</div>}

      {/* Display First Prediction */}
      {firstPrediction && (
        <div className="text-output mt-5">
          <p>{firstPrediction.output}</p>
        </div>
      )}

      {/* Second Input Form */}
      {firstPrediction && (
        <form className="w-full flex mt-5" onSubmit={handleSecondSubmit}>
          <input
            type="text"
            className="flex-grow"
            value={secondPrompt}
            onChange={(e) => setSecondPrompt(e.target.value)}
            placeholder="Enter the solution"
          />
          <button className="button" type="submit">
            Evaluate
          </button>
        </form>
      )}

      {/* Display Second Prediction */}
      {secondPrediction && (
        <div className="text-output mt-5">
          <p>{secondPrediction.output}</p>
        </div>
      )}
    </div>
  );
}
