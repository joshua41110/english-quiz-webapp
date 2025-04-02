
import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function EnglishQuizApp() {
  const [playerName, setPlayerName] = useState("");
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [playerScore, setPlayerScore] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [showRanking, setShowRanking] = useState(false);

  const questionsURL = "https://script.google.com/macros/s/AKfycbz7ZP8Gvtl8J4SyV4UPScvxgGwYgorDBzpdLFwxpjNOy8e3ixE-pEEoA0uKVcs4wxw/exec";
  const submitURL = "https://script.google.com/macros/s/AKfycbx1JbTy_bP88qkhgaG1Jv1An78qkWEeYi7CwkmGD8Gm4n_Eh-bs6yUyk48v2zzVUto/exec";
  const resultCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpq_qOHDW4OYLGFyj0bSqMLBRmcW_xcGgbzAr1hs8bLNZXRK3V0yPAbLmYibK9Rne7WCp6u4pOl6TX/pub?output=csv";

  useEffect(() => {
    fetch(questionsURL)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setAnswers(Array(data.length).fill(""));
      });
  }, []);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const score = answers.reduce((acc, ans, idx) => {
      return acc + (ans.trim().toLowerCase() === questions[idx].en.toLowerCase() ? 1 : 0);
    }, 0);

    const payload = {
      name: playerName,
      answers,
      score
    };

    await fetch(submitURL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setPlayerScore(score);
    setSubmitted(true);
  };

  const fetchAnswers = () => {
    fetch(resultCSV)
      .then(res => res.text())
      .then(csv => {
        const rows = csv.trim().split("\n").slice(1);
        const parsed = rows.map(row => {
          const [name, , answersStr, score] = row.split(",");
          return { name, score: Number(score) };
        });
        const sorted = parsed.sort((a, b) => b.score - a.score);
        const rank = sorted.findIndex(r => r.name === playerName && r.score === playerScore);
        setResults(sorted);
        setPlayerRank(rank >= 0 ? rank + 1 : null);
        setShowRanking(true);
      });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">📘 英文單字考卷</h1>

      {!submitted ? (
        <Card className="p-6">
          <CardContent className="space-y-6">
            <Input
              className="text-lg p-3"
              placeholder="請輸入你的名字"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="grid grid-cols-3 items-center gap-4">
                  <div className="col-span-1 font-medium text-base">{q.zh}</div>
                  <Input
                    className="col-span-2 p-2 text-base"
                    placeholder="英文答案"
                    value={answers[idx]}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <Button className="w-full text-lg py-3" onClick={handleSubmit}>
              提交作答
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">🎉 成績已送出 🎉</h2>
          <p className="text-xl">你答對了 {playerScore} / {questions.length} 題</p>

          {!showRanking && (
            <Button className="mt-4 text-lg py-2 px-4" onClick={fetchAnswers}>
              📊 顯示排行榜
            </Button>
          )}

          {showRanking && (
            <>
              {playerRank && (
                <p className="text-xl font-semibold text-green-600">你目前是第 {playerRank} 名 🏅</p>
              )}
              <div className="mt-6 font-bold text-2xl">🏆 排行榜 🏆</div>
              <div className="space-y-1">
                {results.map((p, idx) => (
                  <div
                    key={idx}
                    className={
                      p.name === playerName && p.score === playerScore
                        ? "font-bold text-blue-600"
                        : "text-gray-700"
                    }
                  >
                    {idx + 1}. {p.name}（{p.score} 分）
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
