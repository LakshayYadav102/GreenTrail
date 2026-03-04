import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoQuiz.css";

const questionsData = [
  {
    question: "Which sector contributes most to global carbon emissions?",
    options: ["Transportation", "Agriculture", "Energy/Power", "Waste Management"],
    answer: "Energy/Power",
  },
  {
    question: "What is the primary greenhouse gas emitted by livestock?",
    options: ["Carbon Dioxide", "Methane", "Nitrous Oxide", "Ozone"],
    answer: "Methane",
  },
  {
    question: "How long does a plastic bottle take to decompose?",
    options: ["50 Years", "100 Years", "450 Years", "Never"],
    answer: "450 Years",
  },
];

const EcoQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizOver, setQuizOver] = useState(false);
  const navigate = useNavigate();

  const handleAnswerClick = (option) => {
    setSelectedOption(option);
    if (option === questionsData[currentQuestion].answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questionsData.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setQuizOver(true);
      }
    }, 800);
  };

  const progress = ((currentQuestion + 1) / questionsData.length) * 100;

  return (
    <div className="gt-quiz-page">
      <div className="gt-quiz-container">
        {!quizOver ? (
          <>
            <div className="gt-quiz-meta">
              <span>QUESTION {currentQuestion + 1} OF {questionsData.length}</span>
              <div className="gt-quiz-progress-track">
                <div className="gt-quiz-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <h2 className="gt-quiz-question">{questionsData[currentQuestion].question}</h2>

            <div className="gt-options-grid">
              {questionsData[currentQuestion].options.map((option, index) => {
                let status = "";
                if (selectedOption === option) {
                  status = option === questionsData[currentQuestion].answer ? "correct" : "wrong";
                }
                return (
                  <button
                    key={index}
                    className={`gt-quiz-option ${status}`}
                    onClick={() => handleAnswerClick(option)}
                    disabled={selectedOption !== null}
                  >
                    <span className="gt-option-letter">{String.fromCharCode(65 + index)}</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="gt-results-screen">
            <div className="gt-result-circle">
               <div className="gt-result-value">{Math.round((score/questionsData.length)*100)}%</div>
               <div className="gt-result-label">ACCURACY</div>
            </div>
            <h3>MISSION COMPLETE</h3>
            <p>You scored {score} out of {questionsData.length} correctly.</p>
            <div className="gt-result-actions">
              <button className="gt-btn-retry" onClick={() => window.location.reload()}>RETRY</button>
              <button className="gt-btn-hub" onClick={() => navigate("/games")}>BACK TO HUB</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoQuiz;