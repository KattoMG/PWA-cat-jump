import React, { useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { GameScore } from '../types';
import { Trophy } from 'lucide-react';

const ScoreHistory: React.FC = () => {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { getAll } = useIndexedDB<GameScore>({
    dbName: 'catJumpDB',
    storeName: 'scores'
  });

  useEffect(() => {
    if (isOpen) {
      loadScores();
    }
  }, [isOpen]);

  const loadScores = async () => {
    try {
      const allScores = await getAll();
      // Sort by score (highest first)
      const sortedScores = allScores.sort((a, b) => b.score - a.score);
      setScores(sortedScores.slice(0, 10)); // Get top 10 scores
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-300"
      >
        <Trophy className="mr-2" size={16} />
        {isOpen ? 'Hide Score History' : 'Show Score History'}
      </button>

      {isOpen && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4 max-h-60 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Your Top Scores</h3>
          
          {scores.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No scores recorded yet. Play a game!</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={score.id} className="border-b last:border-b-0">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{score.score}</td>
                    <td className="py-2 text-sm text-gray-600">{formatDate(score.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreHistory;