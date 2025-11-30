import { useState } from "react";
import { Send, ThumbsUp, ThumbsDown, Loader2, Check } from "lucide-react";
import { sentimentApi } from "../api/sentimentApi";
import type { Review } from "../types/sentiment";

export const ReviewInput: React.FC = () => {
  const [reviewText, setReviewText] = useState("");
  const [prediction, setPrediction] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) {
      setError("Please enter a review to analyze");
      return;
    }

    if (reviewText.trim().length < 5) {
      setError("Review must be at least 5 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sentimentApi.analyzeReview(reviewText);
      if (response.status === "success") {
        setPrediction(response.data);
      } else {
        setError(response.message || "Failed to analyze review");
      }
    } catch (err) {
      setError("An error occurred while analyzing the review");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  };

  const handleClear = () => {
    setReviewText("");
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your review...."
          rows={4}
          className="w-full px-6 py-4 bg-gray-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-100 placeholder-gray-600"
          disabled={loading}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {reviewText.length} characters
          </p>
          {reviewText.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fadeIn">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !reviewText.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Analyze</span>
          </>
        )}
      </button>

      {/* Prediction Result */}
      {prediction && !loading && (
        <div className="animate-fadeInUp">
          <div
            className={`rounded-2xl p-6 border-2 ${
              prediction.sentiment === "Positive"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${
                  prediction.sentiment === "Positive"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                <Check className="w-5 h-5" />
                {prediction.sentiment === "Positive" ? (
                  <ThumbsUp className="w-6 h-6" />
                ) : (
                  <ThumbsDown className="w-6 h-6" />
                )}
                <span className="font-bold text-lg">
                  {prediction.sentiment} Sentiment Detected
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {prediction.sentiment === "Positive" ? "👍" : "👎"}
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Confidence Score</span>
                <span
                  className={`text-2xl font-bold ${
                    prediction.sentiment === "Positive"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    prediction.sentiment === "Positive"
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
