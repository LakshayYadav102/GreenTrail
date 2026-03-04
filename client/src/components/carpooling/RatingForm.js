import React, { useState } from "react";
import api from "../../services/api";

function RatingForm({ rideId, revieweeId, onSubmitSuccess }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/rides/ratings",
        { rideId, revieweeId, rating, review }
      );
      alert("Rating submitted!");
      onSubmitSuccess(res.data.rating);
    } catch (err) {
      setError("Error submitting rating");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h4 className="text-md font-semibold mb-2">Rate the Ride</h4>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full p-2 border rounded-lg mb-2"
      >
        {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} Stars</option>)}
      </select>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write your review..."
        className="w-full p-2 border rounded-lg mb-2"
        rows="3"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button type="submit" className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700">
        Submit Rating
      </button>
    </form>
  );
}

export default RatingForm;