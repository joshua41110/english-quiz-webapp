
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

  const questionsURL = "https://script.google.com/macros/s/AKfycbz7ZP8Gvtl8J4SyV4UPScvxgGwYgorDBzpdLFwxpjNOy8e3ixE-pEEoA0uKVcs4wxw/exec";
  const submitURL = "https://script.google.com/macros/s/AKfycbx1JbTy_bP88qkhgaG1Jv1An78qkWEeYi7CwkmGD8Gm4n_Eh-bs6yUyk48v2zzVUto/exec";

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

    setSubmitted(true);
    fetchAnswers();
  };

  const fetchAnswers = () => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vT-XsJ5I0MCkztdhdVthqKPu1yHEyB6b0kp5SYQyWh_u8nxJj3hRtfau7NPpYeL5aIY6ptMbzXxYdYl/pub?output=csv")
      .then(res => res.text())
      .then(csv => {
        const rows = csv.trim().split("\n").slice(1);
        const parsed = rows.map(row => {
          const [name, , answersStr, score] = row.split(",");
          return { name, score: Number(score) };
        });
        setResults(parsed);
      });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">英文單字考卷</h1>

      {!submitted ? (
        <Card className="p-4">
          <CardContent className="space-y-4">
            <Input
              placeholder="請輸入你的名字"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            {questions.map((q, idx) => (
              <div key={idx} className="grid grid-cols-3 items-center gap-2">
                <div className="col-span-1 font-medium">{q.zh}</div>
                <Input
                  placeholder="英文答案"
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                />
              </div>
            ))}
            <Button className="w-full" onClick={handleSubmit}>
              提交作答
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">🎉 成績已送出 🎉</h2>
          <div className="mt-4 font-bold text-xl">🏆 排行榜 🏆</div>
          {results
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => (
              <div key={idx}>
                {idx + 1}. {p.name}（{p.score} 分）
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
