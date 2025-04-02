import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EnglishQuizApp() {
  const [players, setPlayers] = useState(["", ""]);
  const [answers, setAnswers] = useState([[], []]);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbz7ZP8Gvtl8J4SyV4UPScvxgGwYgorDBzpdLFwxpjNOy8e3ixE-pEEoA0uKVcs4wxw/exec")
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setAnswers([Array(data.length).fill(""), Array(data.length).fill("")]);
      });
  }, []);

  const handleNameChange = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleAnswerChange = (playerIndex, questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[playerIndex][questionIndex] = value;
    setAnswers(newAnswers);
  };

  const checkAnswers = (playerAnswers) => {
    return playerAnswers.map((ans, i) => ans.trim().toLowerCase() === questions[i].en.toLowerCase());
  };

  const results = answers.map(checkAnswers);
  const scores = results.map((r) => r.filter(Boolean).length);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">英文單字考卷</h1>

      {players.map((player, pIdx) => (
        <Card key={pIdx} className="p-4">
          <CardContent className="space-y-4">
            <Input
              placeholder={`玩家 ${pIdx + 1} 的名字`}
              value={player}
              onChange={(e) => handleNameChange(pIdx, e.target.value)}
              disabled={submitted}
            />
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="grid grid-cols-3 items-center gap-2">
                <div className="col-span-1 font-medium">{q.zh}</div>
                <Input
                  className={submitted ?
                    results[pIdx][qIdx] ? "border-green-500" : "border-red-500"
                    : ""
                  }
                  placeholder="英文答案"
                  value={answers[pIdx][qIdx]}
                  onChange={(e) => handleAnswerChange(pIdx, qIdx, e.target.value)}
                  disabled={submitted}
                />
                {submitted && (
                  <div className="text-sm text-gray-500">
                    正解: {q.en}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {!submitted ? (
        <Button className="w-full" onClick={() => setSubmitted(true)}>
          對答案並公布分數
        </Button>
      ) : (
        <div className="text-center space-y-2">
          {players.map((name, i) => (
            <div key={i} className="text-lg">
              {name || `玩家 ${i + 1}`}：{scores[i]} / {questions.length} 題正確
            </div>
          ))}

          <div className="mt-4 font-bold text-xl">🏆 排行榜 🏆</div>
          {players
            .map((name, i) => ({ name: name || `玩家 ${i + 1}`, score: scores[i] }))
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
