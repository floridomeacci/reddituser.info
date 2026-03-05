/**
 * Lightweight browser-based ML utilities
 * All processing happens client-side — zero server cost
 */

// ============================================
// 1. AFINN Sentiment (2KB word list)
// ============================================
const AFINN = {
  'love': 3, 'loved': 3, 'loves': 3, 'loving': 3, 'amazing': 4, 'awesome': 4,
  'excellent': 4, 'fantastic': 4, 'wonderful': 4, 'great': 3, 'good': 3,
  'happy': 3, 'joy': 3, 'beautiful': 3, 'brilliant': 4, 'outstanding': 5,
  'perfect': 3, 'best': 3, 'better': 2, 'nice': 2, 'cool': 2, 'fun': 2,
  'enjoy': 2, 'enjoyed': 2, 'glad': 2, 'helpful': 2, 'thanks': 2, 'thank': 2,
  'impressive': 3, 'incredible': 4, 'superb': 5, 'magnificent': 4,
  'delightful': 3, 'pleasant': 2, 'exciting': 3, 'thrilled': 4,
  'recommend': 2, 'recommended': 2, 'favorite': 2, 'favourite': 2,
  'agree': 1, 'win': 2, 'won': 2, 'winning': 2, 'success': 2, 'successful': 2,
  'laugh': 2, 'laughing': 2, 'lol': 2, 'lmao': 2, 'haha': 2, 'hilarious': 3,
  'funny': 2, 'interesting': 2, 'fascinated': 3, 'inspiring': 3,
  'gorgeous': 3, 'elegant': 3, 'charming': 2, 'clever': 2, 'genius': 3,
  'brave': 2, 'hero': 2, 'heroic': 3, 'kind': 2, 'kindness': 3,
  'generous': 2, 'grateful': 2, 'appreciation': 2, 'celebrate': 2,
  'triumph': 3, 'victory': 3, 'revolutionary': 3, 'phenomenal': 4,
  'blessed': 2, 'bliss': 3, 'peaceful': 2, 'calm': 1,
  'comfort': 2, 'comfortable': 2, 'heaven': 2,
  'like': 1, 'liked': 1, 'useful': 2, 'worth': 1, 'positive': 2,
  'pretty': 1, 'hope': 1, 'hoping': 1, 'proud': 2, 'relief': 2,
  'hate': -3, 'hated': -3, 'hates': -3, 'hating': -3, 'terrible': -3,
  'horrible': -3, 'awful': -3, 'worst': -4, 'bad': -2, 'sucks': -3,
  'stupid': -3, 'idiot': -3, 'dumb': -2, 'ugly': -2, 'boring': -2,
  'annoying': -2, 'annoyed': -2, 'angry': -3, 'anger': -3, 'furious': -4,
  'disgusting': -3, 'pathetic': -3, 'trash': -3, 'garbage': -3,
  'useless': -2, 'pointless': -2, 'waste': -2, 'fail': -2, 'failed': -2,
  'failure': -2, 'wrong': -2, 'broken': -2, 'destroy': -3, 'destroyed': -3,
  'kill': -3, 'killed': -3, 'die': -3, 'died': -2, 'death': -2, 'dead': -2,
  'sad': -2, 'depressed': -3, 'depressing': -3, 'lonely': -2, 'alone': -1,
  'cry': -2, 'crying': -2, 'pain': -2, 'painful': -2, 'suffer': -3,
  'suffering': -3, 'hurt': -2, 'hurts': -2, 'sick': -2, 'tired': -1,
  'exhausted': -2, 'frustrated': -2, 'frustrating': -2, 'disappointment': -2,
  'disappointed': -2, 'disappoint': -2, 'regret': -2, 'sorry': -1,
  'fear': -2, 'afraid': -2, 'scared': -2, 'terrified': -3, 'panic': -3,
  'anxiety': -2, 'anxious': -2, 'worried': -2, 'worry': -2, 'nervous': -2,
  'toxic': -3, 'abuse': -3, 'abusive': -3, 'violent': -3, 'violence': -3,
  'scam': -3, 'fraud': -3, 'lie': -2, 'lies': -2, 'liar': -3, 'fake': -2,
  'steal': -3, 'stolen': -3, 'cheat': -3, 'corrupt': -3, 'evil': -3,
  'damn': -2, 'shit': -2, 'fuck': -3, 'fucking': -3, 'bullshit': -4,
  'ass': -2, 'asshole': -4, 'bastard': -4, 'bitch': -4, 'crap': -2,
  'hell': -1, 'wtf': -2, 'stfu': -3, 'smh': -1,
  'dislike': -2, 'disagree': -1, 'lose': -1, 'lost': -1, 'losing': -1,
  'miss': -1, 'missing': -1, 'problem': -1, 'problems': -1, 'issue': -1,
  'bug': -1, 'error': -1, 'crash': -2, 'crashed': -2, 'ban': -2, 'banned': -2,
  'spam': -2, 'troll': -2, 'cringe': -2, 'overrated': -2, 'mediocre': -1,
  'meh': -1, 'nah': -1, 'nope': -1, 'deny': -1, 'denied': -2,
  'unfair': -2, 'unjust': -2, 'biased': -2, 'racist': -4, 'sexist': -4,
  'ignorant': -2, 'arrogant': -2, 'selfish': -2, 'greedy': -2, 'lazy': -2,
  'weak': -1, 'poor': -1, 'cheap': -1, 'ridiculous': -2, 'absurd': -2,
  'nonsense': -2, 'insane': -1, 'crazy': -1, 'bizarre': -1, 'weird': -1
};

const EMOTION_WORDS = {
  joy: ['happy','happiness','joy','joyful','love','loved','loving','excited','exciting','wonderful',
    'amazing','awesome','fantastic','great','excellent','beautiful','brilliant','delighted','grateful',
    'blessed','celebrate','paradise','bliss','thrilled','ecstatic','cheerful','glad','pleased',
    'laugh','laughing','lol','lmao','haha','hilarious','funny','fun','enjoy','enjoying','enjoyed',
    'perfect','gorgeous','magnificent','superb','outstanding','phenomenal','incredible','triumph'],
  anger: ['angry','anger','furious','rage','raging','hate','hated','hating','pissed','mad',
    'annoyed','annoying','irritated','irritating','frustrated','frustrating','outraged','hostile',
    'aggressive','violent','destroy','fuck','fucking','shit','bullshit','asshole','bastard','bitch',
    'damn','idiot','stupid','dumb','pathetic','disgusting','disgust','despise','loathe','infuriating',
    'enraged','livid','seething','wtf','stfu','toxic','abusive'],
  sadness: ['sad','sadness','depressed','depressing','depression','lonely','loneliness','miss','missing',
    'cry','crying','cried','tears','heartbroken','heartbreak','grief','grieving','mourn','mourning',
    'loss','lost','hurt','hurting','pain','painful','suffer','suffering','sorrow','miserable',
    'hopeless','helpless','despair','devastated','broken','empty','numb','melancholy','gloomy',
    'regret','regretful','sorry','apologize','unfortunately','tragic','tragedy'],
  fear: ['afraid','fear','fearful','scared','scary','terrified','terrifying','horror','horrible',
    'panic','panicking','anxious','anxiety','worried','worry','worrying','nervous','dread','dreading',
    'creepy','eerie','spooky','haunting','nightmare','phobia','paranoid','paranoia','alarming',
    'alarmed','startled','trembling','shaking','unsafe','danger','dangerous','threat','threatening',
    'intimidating','intimidated','vulnerable','uneasy'],
  surprise: ['surprised','surprising','shock','shocked','shocking','unexpected','unbelievable',
    'incredible','insane','crazy','wow','omg','whoa','mindblown','astonishing',
    'astonished','astounding','stunned','stunning','speechless','wtf','bizarre','weird','strange']
};

/**
 * Score a text using AFINN word list
 * @returns {number} sentiment score (-5 to +5 normalized)
 */
export function afinnScore(text) {
  if (!text) return 0;
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  let total = 0;
  let counted = 0;
  for (const word of words) {
    if (AFINN[word] !== undefined) {
      total += AFINN[word];
      counted++;
    }
  }
  return counted === 0 ? 0 : total / counted;
}

/**
 * Classify text sentiment as positive/neutral/negative
 */
export function classifySentiment(text) {
  const score = afinnScore(text);
  if (score > 0.5) return 'positive';
  if (score < -0.5) return 'negative';
  return 'neutral';
}

/**
 * Detect emotions in text using word lists
 */
export function detectEmotions(text) {
  if (!text) return { joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0 };
  const words = text.toLowerCase().split(/\W+/);
  const scores = {};
  for (const [emotion, keywords] of Object.entries(EMOTION_WORDS)) {
    let count = 0;
    for (const word of words) {
      if (keywords.includes(word)) count++;
    }
    scores[emotion] = count;
  }
  return scores;
}

// ============================================
// 2. Lightweight NLP utilities
// ============================================

const STOP_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with',
  'he','as','you','do','at','this','but','his','by','from','they','we','her','she',
  'or','an','will','my','one','all','would','there','their','what','so','up','out',
  'if','about','who','get','which','go','me','when','make','can','like','time','no',
  'just','him','know','take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come','its','over','think',
  'also','back','after','use','two','how','our','work','first','well','way','even',
  'new','want','because','any','these','give','day','most','us','was','were','been',
  'has','had','are','is','am','did','does','got','said','dont','ive','youre',
  'thats','cant','wont','isnt','arent','didnt','doesnt','wasnt','werent','shouldnt',
  'wouldnt','couldnt','theres','heres','whats','theyve','weve','youve',
  'gonna','wanna','gotta','kinda','sorta','really','very','much','many','more',
  'thing','things','something','anything','everything','nothing','still','already',
  'going','getting','trying','need','right','makes','made','lot','pretty','actually',
  'think','thought','feel','sure','point','say','saying','mean','guess','seems',
  'maybe','probably','literally','basically','honestly','definitely','totally',
  'yeah','yes','nah','nope','okay','lol','edit','deleted','removed','http','https',
  'www','com','org','reddit','subreddit','post','comment','thread','link','amp','quot'
]);

/**
 * Extract key topics from texts using TF approach
 */
export function extractTopics(texts, topN = 20) {
  const freq = {};
  for (const text of texts) {
    if (!text) continue;
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    for (const word of words) {
      if (word.length < 3 || STOP_WORDS.has(word)) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Extract capitalized proper nouns that appear multiple times
 */
export function extractEntities(texts, topN = 15) {
  const freq = {};
  for (const text of texts) {
    if (!text) continue;
    const matches = text.match(/(?<=\s)[A-Z][a-z]{2,}/g);
    if (matches) {
      for (const word of matches) {
        const lower = word.toLowerCase();
        if (STOP_WORDS.has(lower)) continue;
        freq[word] = (freq[word] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([entity, count]) => ({ entity, count }));
}

/**
 * Readability score (Flesch-Kincaid simplified)
 */
export function readabilityScore(text) {
  if (!text || text.length < 10) return null;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  if (sentences.length === 0 || words.length === 0) return null;
  const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Toxicity estimation using word lists
 * @returns {number} 0-100 toxicity score
 */
export function toxicityScore(text) {
  if (!text) return 0;
  const words = text.toLowerCase().split(/\W+/);
  const toxicWords = [
    'fuck','fucking','shit','bullshit','asshole','bitch','bastard','damn','crap',
    'dick','ass','stfu','gtfo','idiot','moron','stupid','dumb','retard','retarded',
    'kill','die','death','murder','racist','sexist','nazi','fascist',
    'trash','garbage','worthless','pathetic','disgusting','loser','scum',
    'toxic','abuse','abusive','harass','harassment','troll','spam',
    'hate','hating','despise','degenerate','incel','simp','cope'
  ];
  let toxicCount = 0;
  for (const word of words) {
    if (toxicWords.includes(word)) toxicCount++;
  }
  const ratio = words.length > 0 ? toxicCount / words.length : 0;
  return Math.min(100, Math.round(ratio * 500));
}

/**
 * Writing style fingerprint
 */
export function writingFingerprint(texts) {
  let totalWords = 0, totalSentences = 0, totalChars = 0;
  let questions = 0, exclamations = 0, capsWords = 0, emojiCount = 0;
  let totalTexts = 0;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  for (const text of texts) {
    if (!text || text.length < 5) continue;
    totalTexts++;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalWords += words.length;
    totalSentences += sentences.length;
    totalChars += text.replace(/\s/g, '').length;
    if (text.includes('?')) questions++;
    if (text.includes('!')) exclamations++;
    capsWords += words.filter(w => w === w.toUpperCase() && w.length > 1 && /[A-Z]/.test(w)).length;
    const emojis = text.match(emojiRegex);
    if (emojis) emojiCount += emojis.length;
  }
  if (totalTexts === 0) return null;
  return {
    avgWordLength: totalChars / Math.max(totalWords, 1),
    avgSentenceLength: totalWords / Math.max(totalSentences, 1),
    questionRate: (questions / totalTexts) * 100,
    exclamationRate: (exclamations / totalTexts) * 100,
    capsRate: (capsWords / Math.max(totalWords, 1)) * 100,
    emojiRate: (emojiCount / totalTexts) * 100,
  };
}

/**
 * Process all comments for emotion timeline
 */
export function emotionTimeline(comments) {
  if (!comments?.length) return [];
  const months = {};
  for (const comment of comments) {
    const body = comment.body || comment.comment || '';
    const ts = comment.created_utc;
    if (!body || !ts) continue;
    const date = new Date(ts * 1000);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { month: key, joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, total: 0 };
    const emotions = detectEmotions(body);
    months[key].joy += emotions.joy;
    months[key].anger += emotions.anger;
    months[key].sadness += emotions.sadness;
    months[key].fear += emotions.fear;
    months[key].surprise += emotions.surprise;
    months[key].total++;
  }
  return Object.values(months)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => {
      const sum = m.joy + m.anger + m.sadness + m.fear + m.surprise;
      if (sum === 0) return { ...m, joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0 };
      return {
        month: m.month,
        joy: Math.round((m.joy / sum) * 100),
        anger: Math.round((m.anger / sum) * 100),
        sadness: Math.round((m.sadness / sum) * 100),
        fear: Math.round((m.fear / sum) * 100),
        surprise: Math.round((m.surprise / sum) * 100),
        total: m.total
      };
    });
}

/**
 * Batch sentiment timeline
 */
export function sentimentTimeline(comments) {
  if (!comments?.length) return [];
  const months = {};
  for (const comment of comments) {
    const body = comment.body || comment.comment || '';
    const ts = comment.created_utc;
    if (!body || !ts) continue;
    const date = new Date(ts * 1000);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { month: key, scores: [], positive: 0, negative: 0, neutral: 0, total: 0 };
    const score = afinnScore(body);
    const cls = classifySentiment(body);
    months[key].scores.push(score);
    months[key][cls]++;
    months[key].total++;
  }
  return Object.values(months)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: m.month,
      avgScore: m.scores.reduce((s, v) => s + v, 0) / m.scores.length,
      positive: Math.round((m.positive / m.total) * 100),
      negative: Math.round((m.negative / m.total) * 100),
      neutral: Math.round((m.neutral / m.total) * 100),
      total: m.total
    }));
}
