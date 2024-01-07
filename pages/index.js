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
      " Rate this solution from Innovation and Originality, Environmental Impact, Market Potential, Economic Viability, Execution Feasibility, and Thoroughness. Give a final average score from all the metrics at the end.";

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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container max-w-2xl mx-auto p-5">
        <Head>
          <title>Replicate + Next.js</title>
        </Head>

        <h1 className="py-6 text-center font-bold text-4xl md:text-5xl lg:text-6xl text-white shadow-lg">
          Greenalytics:
          <span className="block text-3xl md:text-4xl lg:text-5xl">Your Smart Advisor to the Circular Economy</span>
        </h1>


        {/* First Input Form */}
        <form className="w-full flex" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-grow text-black" // Add text-black to set the text color to black
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
          <div className="text-output mt-5 bg-white p-4 text-black border border-gray-300 rounded-md shadow-sm">
            <p>{firstPrediction.output}</p>
          </div>
        )}

        {/* Second Input Form */}
        {firstPrediction && (
          <form className="w-full flex mt-5" onSubmit={handleSecondSubmit}>
            <input
              type="text"
              className="flex-grow text-black" // Add text-black to set the text color to black
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
          <div className="text-output mt-5 bg-white p-4 text-black border border-gray-300 rounded-md shadow-sm">
            <p>{secondPrediction.output}</p>
          </div>
        )}
      </div>
      <footer className="bg-green-50 w-full text-center p-4">
        <p className="text-xs md:text-sm font-semibold text-gray-700">
          Powered by Mixtral 8x7b, Developed by Baller AI
        </p>
      </footer>
    </div>
  );
}
