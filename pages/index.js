
import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function EnglishQuizApp() {
  const [playerIndex, setPlayerIndex] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [storedAnswers, setStoredAnswers] = useState([null, null]);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbz7ZP8Gvtl8J4SyV4UPScvxgGwYgorDBzpdLFwxpjNOy8e3ixE-pEEoA0uKVcs4wxw/exec")
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setAnswers(Array(data.length).fill(""));
      });
  }, []);

  const handleAnswerChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const newStored = [...storedAnswers];
    newStored[playerIndex] = { name: playerName, answers };
    setStoredAnswers(newStored);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setPlayerIndex(null);
    setPlayerName("");
    setAnswers(Array(questions.length).fill(""));
    setSubmitted(false);
  };

  const getResults = () => {
    return storedAnswers.map(player => {
      if (!player) return null;
      const correct = player.answers.map((ans, i) => ans.trim().toLowerCase() === questions[i].en.toLowerCase());
      const score = correct.filter(Boolean).length;
      return { name: player.name, score, correct };
    });
  };

  const results = getResults();

  if (playerIndex === null) {
    return (
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-center">選擇你是誰</h1>
        <div className="space-y-2">
          {[0, 1].map(i => (
            <Button key={i} onClick={() => setPlayerIndex(i)}>
              我是 玩家 {i + 1}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!submitted && storedAnswers[playerIndex]) {
    return (
      <div className="p-4 text-center space-y-4">
        <h1 className="text-xl">你已經作答過囉 🎉</h1>
        <Button onClick={resetQuiz}>返回</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center">英文單字考卷 - 玩家 {playerIndex + 1}</h1>

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
        <>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">🎉 成績公布 🎉</h2>
            {results.map((res, i) => res && (
              <div key={i} className="text-lg">
                {res.name || `玩家 ${i + 1}`}：{res.score} / {questions.length} 題正確
              </div>
            ))}

            <div className="mt-4 font-bold text-xl">🏆 排行榜 🏆</div>
            {[...results]
              .filter(Boolean)
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => (
                <div key={idx}>
                  {idx + 1}. {p.name}（{p.score} 分）
                </div>
              ))}
          </div>
          <Button className="mt-4 w-full" onClick={resetQuiz}>
            重新開始
          </Button>
        </>
      )}
    </div>
  );
}
