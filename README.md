# Reddit User Analyzer - Frontend

A comprehensive React dashboard for analyzing Reddit user activity, behavior patterns, and content.

## Server Configuration

### API Endpoint
- **Production Server**: Configure your own API server
- **Server Files Location**: `/opt/reddit-analyzer/`

### API Endpoints

#### `POST /analyze`
Fetches and analyzes a Reddit user's data.

**Request:**
```json
{
  "username": "RedditUsername",
  "force_refresh": false  // Optional: true to bypass cache
}
```

**Response Format:**
```json
{
  "about": {
    "name": "username",
    "created_utc": 1608365871.0,
    "comment_karma": 1295,
    "link_karma": 1216,
    "total_karma": 2511,
    "icon_img": "https://...",
    "snoovatar_img": "https://...",
    "is_gold": false,
    "is_mod": false,
    "has_verified_email": true,
    "subreddit": { ... }
  },
  "comments": [
    {
      "body": "Comment text content",
      "comment": "Comment text content (alias)",
      "created_utc": 1767111548.0,
      "timestamp": 1767111548.0,
      "score": 15,
      "karma": 15,
      "subreddit": "AskReddit",
      "permalink": "/r/AskReddit/comments/...",
      "url": "https://reddit.com/r/AskReddit/comments/...",
      "link_id": "t3_abc123",
      "parent_id": "t1_xyz789",
      "author": "username",
      "over_18": false
    }
  ],
  "posts": [
    {
      "title": "Post title",
      "post": "Post title (alias)",
      "selftext": "Post body text",
      "created_utc": 1767010588.0,
      "timestamp": 1767010588.0,
      "score": 42,
      "karma": 42,
      "subreddit": "pics",
      "permalink": "/r/pics/comments/...",
      "url": "https://i.redd.it/...",
      "media": "https://...",
      "over_18": true,
      "removed_by_category": "moderator"
    }
  ]
}
```

### Key Data Fields

| Field | Location | Description |
|-------|----------|-------------|
| `about.created_utc` | about | Account creation timestamp (Unix) |
| `about.comment_karma` | about | Total comment karma |
| `about.link_karma` | about | Total post karma |
| `about.total_karma` | about | Combined karma |
| `comment.body` | comments[] | Comment text (raw Reddit field) |
| `comment.comment` | comments[] | Comment text (compatibility alias) |
| `comment.created_utc` | comments[] | Timestamp (raw Reddit field) |
| `comment.timestamp` | comments[] | Timestamp (compatibility alias) |
| `comment.score` | comments[] | Karma score (raw Reddit field) |
| `comment.karma` | comments[] | Karma score (compatibility alias) |
| `post.title` | posts[] | Post title |
| `post.selftext` | posts[] | Post body text |
| `post.removed_by_category` | posts[] | Removal reason if removed |
| `*.over_18` | both | NSFW flag |
| `*.subreddit` | both | Subreddit name |
| `*.link_id` | comments | Thread ID (t3_xxx) |
| `*.parent_id` | comments | Parent comment/post ID |

### Proxy Configuration
- Proxy: `http://jokubelis:brancaleonas_country-us@geo.iproyal.com:11200`
- Simple rotating proxy (no sessions)

### Data Storage
- **Permanent Data**: `/opt/reddit-analyzer/data/{username.lower()}.json`
  - Never deleted or overwritten
  - New data is **merged** with existing (keeps all unique comments/posts)
  - Tracks `first_fetched` and `last_fetched` timestamps
- **Cache**: `/opt/reddit-analyzer/cache/{username.lower()}.json`
  - Quick access copy of permanent data

### Data Merging
When `force_refresh=true`:
1. Fetches new data from Reddit API
2. Loads existing stored data
3. Merges by comparing `id` fields (only adds new unique items)
4. Updates `about` with latest profile info
5. Saves merged data to both `/data/` and `/cache/`

---

## Project Structure

```
reddituser_v2/
├── src/
│   ├── pages/
│   │   └── CopyPage.jsx       # Main dashboard page (ACTIVE)
│   ├── widgets/               # All widget components
│   ├── components/            # Shared components (charts, modals)
│   ├── lib/
│   │   └── apiClient.js       # API communication
│   ├── design-tokens.js       # Color/style constants
│   └── design-system.css      # Global styles
├── public/
└── package.json
```

---

## Widgets Reference

### Account Stats
| Widget | File | Description |
|--------|------|-------------|
| **AccountAge** | `AccountAge.jsx` | Displays account age calculated from `about.created_utc` |
| **TotalKarma** | `TotalKarma.jsx` | Shows total karma from `about.total_karma` |
| **TotalComments** | `TotalComments.jsx` | Count of comments |
| **TotalPosts** | `TotalPosts.jsx` | Count of posts |
| **Contributions** | `Contributions.jsx` | Combined comment/post counts with avatar |
| **LongestStreak** | `LongestStreak.jsx` | Longest consecutive days of activity |

### Activity Patterns
| Widget | File | Description |
|--------|------|-------------|
| **ActivityHeatmap** | `ActivityHeatmap.jsx` | Hour vs day-of-week heatmap |
| **ActivityByMonth** | `ActivityByMonth.jsx` | Monthly activity chart |
| **ActivityByWeekday** | `ActivityByWeekday.jsx` | Activity by day of week |
| **ActivityByDayOfMonth** | `ActivityByDayOfMonth.jsx` | Activity by day of month |
| **HourlyPulse** | `HourlyPulse.jsx` | Activity distribution by hour |

### Content Analysis
| Widget | File | Description |
|--------|------|-------------|
| **TopSubredditsTreemap** | `TopSubredditsTreemap.jsx` | Treemap of most active subreddits |
| **SubredditBreakdown** | `SubredditBreakdown.jsx` | Subreddit activity breakdown |
| **SubredditActivityOverTime** | `SubredditActivityOverTime.jsx` | Subreddit activity timeline |
| **TopComments** | `TopComments.jsx` | Highest karma comments |
| **TopPosts** | `TopPosts.jsx` | Highest karma posts |
| **WorstComments** | `WorstComments.jsx` | Lowest karma comments |
| **WorstPosts** | `WorstPosts.jsx` | Lowest karma posts |
| **TopWorstContent** | `TopWorstContent.jsx` | Combined top/worst content view |
| **ContentSearch** | `ContentSearch.jsx` | Search through user's content |
| **RecentActivity** | `RecentActivity.jsx` | Media gallery carousel with NSFW blur |

### Karma & Engagement
| Widget | File | Description |
|--------|------|-------------|
| **KarmaMomentum** | `KarmaMomentum.jsx` | Karma trend over recent comments |
| **KarmaDistribution** | `KarmaDistribution.jsx` | Bell curve of karma scores |
| **KarmaSplitByMonth** | `KarmaSplitByMonth.jsx` | Monthly karma from comments vs posts |
| **LengthVsKarma** | `LengthVsKarma.jsx` | Comment length vs karma correlation |
| **EngagementLeaderboard** | `EngagementLeaderboard.jsx` | Top engaging comments by subreddit |

### Linguistic Analysis
| Widget | File | Description |
|--------|------|-------------|
| **PronounUsage** | `PronounUsage.jsx` | I/You/We/They pronoun distribution |
| **PronounPersonality** | `PronounPersonality.jsx` | Personality traits from pronoun usage |
| **TopWords** | `TopWords.jsx` | Most frequently used words |
| **TopWordsOverTime** | `TopWordsOverTime.jsx` | Word usage trends over time |
| **TopEmojis** | `TopEmojis.jsx` | Most used emojis |
| **VocabularyWidget** | `VocabularyWidget.jsx` | Vocabulary diversity metrics |
| **LiteracyGauge** | `LiteracyGauge.jsx` | Reading level analysis |
| **GrammarMistakesWidget** | `GrammarMistakesWidget.jsx` | Grammar error detection |
| **QuestionsVsCommentary** | `QuestionsVsCommentary.jsx` | Question vs statement ratio |
| **LongestCapsSentence** | `LongestCapsSentence.jsx` | Longest ALL CAPS sentence |

### Behavioral Patterns
| Widget | File | Description |
|--------|------|-------------|
| **ReplyPatterns** | `ReplyPatterns.jsx` | Self-replies vs replies to others (uses `link_id` grouping) |
| **CommentFlow** | `CommentFlow.jsx` | Comment thread visualization |
| **CommentLengthDist** | `CommentLengthDist.jsx` | Distribution of comment lengths |
| **BotDetection** | `BotDetection.jsx` | Bot-like behavior indicators |

### Removed/Deleted Content
| Widget | File | Description |
|--------|------|-------------|
| **RemovedComments** | `RemovedComments.jsx` | Detects removed content via `removed_by_category` or `[removed]` text |
| **RemovedCommentsBySubreddit** | `RemovedCommentsBySubreddit.jsx` | Removed content grouped by subreddit |
| **RemovedCommentsOverTime** | `RemovedCommentsOverTime.jsx` | Removed content timeline |

### Sentiment & Personality
| Widget | File | Description |
|--------|------|-------------|
| **SentimentStreaks** | `SentimentStreaks.jsx` | Positive/negative sentiment patterns |
| **WeeklySentiment** | `WeeklySentiment.jsx` | Sentiment by day of week |
| **PersonalityRadar** | `PersonalityRadar.jsx` | Personality trait radar chart |

### Demographics (Predictions)
| Widget | File | Description |
|--------|------|-------------|
| **AgeTimeline** | `AgeTimeline.jsx` | Predicted age over time |
| **GenderTimeline** | `GenderTimeline.jsx` | Predicted gender over time |

### Location & Interests
| Widget | File | Description |
|--------|------|-------------|
| **WorldMapWidget** | `WorldMapWidget.jsx` | Location mentions on world map |
| **TopLocationsWidget** | `TopLocationsWidget.jsx` | Most mentioned locations |
| **InterestWidget** | `InterestWidget.jsx` | Detected interests |
| **LeisureWidget** | `LeisureWidget.jsx` | Leisure activities |
| **KinkWidget** | `KinkWidget.jsx` | NSFW content analysis |

### Advanced Analysis
| Widget | File | Description |
|--------|------|-------------|
| **PCAAnalysis** | `PCAAnalysis.jsx` | Principal component analysis |
| **TSNEClustering** | `TSNEClustering.jsx` | t-SNE clustering visualization |
| **SubredditFlow** | `SubredditFlow.jsx` | Subreddit transition patterns |
| **FavoriteNumber** | `FavoriteNumber.jsx` | Most mentioned numbers |

### Utility
| Widget | File | Description |
|--------|------|-------------|
| **SearchBox** | `SearchBox.jsx` | Username search input with avatar |

---

## Key Implementation Notes

### Data Field Compatibility
The API provides both raw Reddit fields AND compatibility aliases:
- Use `item.body || item.comment` for comment text
- Use `item.created_utc || item.timestamp` for timestamps
- Use `item.score || item.karma` for karma
- Use `userData.about || userData.account_info` for account data

### Self-Reply Detection
Since raw Reddit API doesn't have a `responding` field, self-replies are detected by:
1. Grouping comments by `link_id` (thread)
2. Sorting by timestamp
3. First comment in thread = "other reply"
4. Subsequent comments = "self reply"

### Removed Content Detection
Removed content is detected via:
- `post.removed_by_category` field (e.g., "moderator", "reddit")
- `post.selftext === '[removed]'` or `'[deleted]'`
- `comment.body === '[removed]'` or `'[deleted]'`

### NSFW Detection
- Check `item.over_18` field for NSFW content
- MediaGallery (RecentActivity) blurs NSFW thumbnails

### Location Extraction
When `entities.locations` is not available, widgets fall back to text pattern matching for country/city names.

---

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Server Deployment

```bash
# SSH to server
ssh root@37.27.27.247

# Navigate to project
cd /opt/reddit-analyzer

# Restart API server
pkill -f gunicorn
nohup gunicorn -w 1 -b 0.0.0.0:5000 api_server_simple:app --timeout 120 > gunicorn.log 2>&1 &
```

---

## Relevant Server Files

| File | Description |
|------|-------------|
| `/opt/reddit-analyzer/api_server_simple.py` | Main API server - simplified raw dump approach |
| `/opt/reddit-analyzer/data/` | **Permanent storage** - never deleted, data is merged |
| `/opt/reddit-analyzer/cache/` | Quick access cache (copy of data) |
| `/opt/reddit-analyzer/gunicorn.log` | Server logs |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Fetch/analyze user, merges with existing data |
| `/health` | GET | Server health check |
| `/users` | GET | List all stored users with stats |

### Server-side Queueing (New)

To prevent overload and show users their place in line, the frontend now supports server-managed queuing for analysis requests. When enabled on the server, the flow is:

1) Client POSTs `/analyze` with `{"username":"...","queue":true}` and header `X-Queue: 1`
2) Server responds immediately with a queued status:

```
{
  "status": "queued",         // or "processing"
  "request_id": "abc123",
  "position": 2,               // number in queue (1 = first)
  "eta_seconds": 90            // optional
}
```

3) Client polls `GET /queue/status?request_id=abc123` every ~1.5s until status is `done`
4) Server returns the result either embedded in the status `{ status: 'done', result: {...} }` or via `GET /queue/result?request_id=abc123`

Frontend changes are backward compatible: if the server does not support queueing, `/analyze` will return the analysis as before.

Minimal Flask server implementation sketch (add to `/opt/reddit-analyzer/api_server_simple.py`):

```python
# --- queue.py (inline or separate module) ---
import threading, queue, time, uuid
from typing import Dict

job_q = queue.Queue()        # pending jobs
statuses: Dict[str, dict] = {}

def worker_thread(process_fn):
  while True:
    job = job_q.get()
    if job is None:
      break
    rid = job['request_id']
    statuses[rid]['status'] = 'processing'
    try:
      result = process_fn(job['payload'])
      statuses[rid]['status'] = 'done'
      statuses[rid]['result'] = result
    except Exception as e:
      statuses[rid]['status'] = 'error'
      statuses[rid]['message'] = str(e)
    finally:
      job_q.task_done()

def queue_position(rid: str) -> int:
  # compute 1-based position; simple O(n) scan
  items = list(job_q.queue)
  for i, j in enumerate(items, start=1):
    if j['request_id'] == rid:
      return i
  return 0  # 0 means up next or processing

# In your Flask app startup:
# start a single worker to guarantee concurrency=1
# worker = threading.Thread(target=worker_thread, args=(process_analyze,), daemon=True)
# worker.start()

# --- in your Flask routes ---
@app.route('/analyze', methods=['POST'])
def analyze_route():
  data = request.get_json(force=True)
  username = data.get('username','').strip()
  if not username:
    return jsonify({ 'error': 'username_required' }), 400

  # If client requests queueing, enqueue
  if request.headers.get('X-Queue') == '1' or data.get('queue'):
    rid = uuid.uuid4().hex
    payload = {
      'username': username,
      'force_refresh': bool(data.get('force_refresh')),
      'include_raw': bool(data.get('include_raw')),
      'top': int(data.get('top') or 0)
    }
    statuses[rid] = { 'status': 'queued' }
    job_q.put({ 'request_id': rid, 'payload': payload })
    pos = queue_position(rid)
    return jsonify({ 'status': 'queued', 'request_id': rid, 'position': pos })

  # Backward-compatible: process synchronously
  result = process_analyze({
    'username': username,
    'force_refresh': bool(data.get('force_refresh')),
    'include_raw': bool(data.get('include_raw')),
    'top': int(data.get('top') or 0)
  })
  return jsonify(result)

@app.get('/queue/status')
def queue_status():
  rid = request.args.get('request_id','')
  s = statuses.get(rid)
  if not s:
    return jsonify({ 'status': 'error', 'message': 'unknown_request' }), 404
  pos = queue_position(rid)
  out = { 'status': s.get('status', 'queued'), 'position': pos }
  if 'eta_seconds' in s:
    out['eta_seconds'] = s['eta_seconds']
  if out['status'] == 'done' and 'result' in s:
    # You can omit result here and serve it from /queue/result instead
    pass
  return jsonify(out)

@app.get('/queue/result')
def queue_result():
  rid = request.args.get('request_id','')
  s = statuses.get(rid)
  if not s:
    return jsonify({ 'status': 'error', 'message': 'unknown_request' }), 404
  if s.get('status') != 'done':
    return jsonify({ 'status': s.get('status','queued') }), 202
  return jsonify(s['result'])
```

Hook your existing analysis function into `process_analyze(payload)` so the worker executes it. Keep the worker count at 1 for strict queueing.

Restart after changes:

```bash
ssh root@37.27.27.247
cd /opt/reddit-analyzer
pkill -f gunicorn
nohup gunicorn -w 1 -b 0.0.0.0:5000 api_server_simple:app --timeout 120 > gunicorn.log 2>&1 &
```

## Relevant Frontend Files

| File | Description |
|------|-------------|
| `src/pages/CopyPage.jsx` | **Main dashboard page** - renders all widgets |
| `src/widgets/index.js` | Widget exports |
| `src/widgets/widgetConfig.js` | Widget configuration |
| `src/lib/apiClient.js` | API communication utilities |
| `src/design-tokens.js` | Colors and style constants |
| `src/design-system.css` | Global CSS styles |
| `src/components/` | Shared chart components (HourlyHeatmap, WorldMap, etc.) |
