import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoQuiz.css";

// Sample questions (can be replaced with API data)
const questionsData = [
  {
    question: "What is the main cause of global warming?",
    options: ["Deforestation", "Burning fossil fuels", "Plastic waste", "Overfishing"],
    answer: "Burning fossil fuels",
  },
  {
    question: "Which of these materials is NOT biodegradable?",
    options: ["Banana Peel", "Glass Bottle", "Cotton Cloth", "Paper"],
    answer: "Glass Bottle",
  },
  {
    question: "How much of Earth's water is freshwater?",
    options: ["3%", "10%", "25%", "50%"],
    answer: "3%",
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

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion + 1 < questionsData.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setQuizOver(true);
      }
    }, 1000);
  };

  return (
    <div className="eco-quiz">
      <h2>🌿 Eco Quiz Challenge</h2>

      {!quizOver ? (
        <>
          <h3>{questionsData[currentQuestion].question}</h3>
          <div className="options">
            {questionsData[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedOption === option ? "selected" : ""}`}
                onClick={() => handleAnswerClick(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="quiz-results">
          <h3>Quiz Over!</h3>
          <p>Your Score: {score} / {questionsData.length}</p>
          <button onClick={() => navigate("/games")}>Back to Games</button>
        </div>
      )}
    </div>
  );
};

export default EcoQuiz;
