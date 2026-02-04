// Widget size configuration
// Each widget specifies how many columns and rows it spans
// The layout is determined by CopyPage using CSS Grid auto-placement

export const WIDGET_SIZES = {
  // Small stat cards (1x1)
  SearchBox: { cols: 1, rows: 2 },
  AccountAge: { cols: 1, rows: 1 },
  LongestStreak: { cols: 1, rows: 1 },
  TotalKarma: { cols: 1, rows: 1 },
  Contributions: { cols: 1, rows: 1 },
  
  // Medium widgets (2x2 or similar)
  RecentActivity: { cols: 1, rows: 2 },
  PersonalityRadar: { cols: 2, rows: 2 },
  KarmaSplitByMonth: { cols: 1, rows: 1 },
  TopSubredditsTreemap: { cols: 2, rows: 2 },
  GenderTimeline: { cols: 2, rows: 2 },
  AgeTimeline: { cols: 2, rows: 2 },
  RemovedComments: { cols: 1, rows: 1 },
  
  // Activity widgets
  ActivityHeatmap: { cols: 2, rows: 1 },
  ActivityByDayOfMonth: { cols: 2, rows: 1 },
  ActivityByWeekday: { cols: 1, rows: 2 },
  HourlyPulse: { cols: 2, rows: 2 },
  KarmaMomentum: { cols: 2, rows: 2 },
  
  // Analysis widgets
  LengthVsKarma: { cols: 1, rows: 2 },
  TopEmojis: { cols: 2, rows: 1 },
  TopWords: { cols: 2, rows: 1 },
  QuestionsVsCommentary: { cols: 2, rows: 1 },
  LongestCapsSentence: { cols: 1, rows: 1 },
  SubredditBreakdown: { cols: 2, rows: 2 },
  ActivityByMonth: { cols: 1, rows: 2 },
  
  // Literacy widgets
  LiteracyGauge: { cols: 1, rows: 2 },
  GrammarMistakesWidget: { cols: 2, rows: 2 },
  VocabularyWidget: { cols: 1, rows: 1 },
  
  // Content lists
  TopComments: { cols: 1, rows: 2 },
  TopPosts: { cols: 1, rows: 1 },
  WorstPosts: { cols: 1, rows: 1 },
  WorstComments: { cols: 1, rows: 2 },
  
  // Distribution charts
  KarmaDistribution: { cols: 2, rows: 1 },
  CommentLengthDist: { cols: 2, rows: 1 },
  
  // Flow/Network visualizations
  CommentFlow: { cols: 4, rows: 1 },
  WeeklySentiment: { cols: 2, rows: 2 },
  SubredditFlow: { cols: 2, rows: 2 },
  TopLocationsWidget: { cols: 1, rows: 4 },
  
  // Large visualizations
  SubredditActivityOverTime: { cols: 3, rows: 2 },
  SentimentStreaks: { cols: 2, rows: 1 },
  TSNEClustering: { cols: 2, rows: 2 },
  PCAAnalysis: { cols: 1, rows: 2 },
  WorldMapWidget: { cols: 2, rows: 1 },
};

// Helper to get style object for a widget
export function getWidgetStyle(widgetName, extraStyle = {}) {
  const size = WIDGET_SIZES[widgetName] || { cols: 1, rows: 1 };
  return {
    gridColumn: `span ${size.cols}`,
    gridRow: `span ${size.rows}`,
    ...extraStyle,
  };
}
