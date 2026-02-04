import SentimentStacks from '../components/SentimentStacks';

export default function WeeklySentiment({ userData, style }) {
  return (
    <div className="cell" style={{ ...style }}>
      <h3>Weekly Sentiment Analysis</h3>
      <p className="stat-meta" style={{ marginBottom: '8px' }}>
        Distribution of comment sentiment
      </p>
      <SentimentStacks comments={userData?.comments} />
    </div>
  );
}
