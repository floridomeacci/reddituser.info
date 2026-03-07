"""
Reddit Analyzer API Server
A Flask API that accepts Reddit usernames and returns analysis data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import datetime
import logging
from datetime import datetime as dt_now
from operator import itemgetter
import re
import numpy
import threading
import concurrent.futures
import shelve
import time
import dbm
import io
import sys
import base64
import hashlib
import os
import fcntl
import numpy

# Helper: recursively convert numpy scalars/arrays to native Python types for JSON serialization
def _json_sanitize(obj):
    if isinstance(obj, (numpy.float32, numpy.float64, numpy.int32, numpy.int64)):
        return obj.item()
    if isinstance(obj, (list, tuple)):
        return [ _json_sanitize(x) for x in obj ]
    if isinstance(obj, dict):
        return { k: _json_sanitize(v) for k,v in obj.items() }
    return obj

app = Flask(__name__)
# ---------------- Logging Configuration ----------------
LOG_LEVEL = os.getenv('REDDIT_ANALYZER_LOG_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)
logger = logging.getLogger('reddit_analyzer')
logger.info(f"Starting Reddit Analyzer server version placeholder; log level={LOG_LEVEL}")
# Flask-CORS default sometimes misses error responses under certain server configurations;
# we keep it AND add an explicit after_request hook to guarantee headers.
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

ALLOWED_METHODS = 'GET, POST, OPTIONS'
ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With'
EXPOSE_HEADERS = 'Content-Length'

@app.after_request
def _ensure_cors_headers(resp):
    # Set default CORS headers if not already present; use setdefault to avoid overwriting explicit per-route values
    resp.headers.setdefault('Access-Control-Allow-Origin', '*')
    resp.headers.setdefault('Access-Control-Allow-Methods', ALLOWED_METHODS)
    resp.headers.setdefault('Access-Control-Allow-Headers', ALLOWED_HEADERS)
    resp.headers.setdefault('Access-Control-Expose-Headers', EXPOSE_HEADERS)
    resp.headers.setdefault('Access-Control-Max-Age', '86400')  # cache preflight for 24h
    logger.debug(f"CORS headers applied: origin={resp.headers.get('Access-Control-Allow-Origin')} methods={resp.headers.get('Access-Control-Allow-Methods')}")
    return resp

__version__ = '1.1.0'

# Personality prediction imports
try:
    from transformers import BertTokenizer, BertForSequenceClassification
    import torch
    PERSONALITY_AVAILABLE = True
    
    # Initialize personality model (load once at startup)
    print("Loading personality prediction model...")
    personality_tokenizer = BertTokenizer.from_pretrained("Minej/bert-base-personality")
    personality_model = BertForSequenceClassification.from_pretrained("Minej/bert-base-personality")
    print("Personality model loaded successfully!")
except Exception as e:
    print(f"Warning: Personality prediction not available: {e}")
    PERSONALITY_AVAILABLE = False
    personality_tokenizer = None
    personality_model = None

# Sentiment analysis with spaCy - DISABLED
# try:
#     import spacy
#     from spacytextblob.spacytextblob import SpacyTextBlob
#     
#     print("Loading spaCy model for sentiment analysis...")
#     nlp = spacy.load('en_core_web_sm')
#     nlp.add_pipe('spacytextblob')
#     SENTIMENT_AVAILABLE = True
#     print("Sentiment analysis loaded successfully!")
# except Exception as e:
#     print(f"Warning: Sentiment analysis not available: {e}")
SENTIMENT_AVAILABLE = False
nlp = None
print("Sentiment analysis DISABLED")

# Named Entity Recognition (NER) - Switched to Spacy to save memory
# try:
#     from transformers import pipeline as hf_pipeline
#     
#     print("Loading NER model for entity extraction...")
#     ner_pipeline = hf_pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
#     NER_AVAILABLE = True
#     print("NER model loaded successfully!")
# except Exception as e:
#     print(f"Warning: NER not available: {e}")
#     NER_AVAILABLE = False
#     ner_pipeline = None
NER_AVAILABLE = True # We use Spacy now

# Grammar checking with LanguageTool
# DISABLED to save memory on small server
GRAMMAR_AVAILABLE = False
grammar_tool = None
# try:
#     import language_tool_python
#     print("Initializing LanguageTool for grammar checking...")
#     grammar_tool = language_tool_python.LanguageTool('auto')
#     GRAMMAR_AVAILABLE = True
#     print("LanguageTool loaded successfully!")
# except Exception as e:
#     print(f"Warning: Grammar checking not available: {e}")
#     GRAMMAR_AVAILABLE = False
#     grammar_tool = None

# ------------------ Age & Gender Prediction (TF-IDF + RandomForest) - DISABLED ------------------
# Loaded from the Age-and-Gender-prediction-model-based-on-text directory if present.
AGE_GENDER_AVAILABLE = False
"""Model directory resolution:
By default use a sibling directory 'Age-and-Gender-prediction-model-based-on-text' next to this api_server.py.
Previously we erroneously pointed one level up which broke model loading on the remote host.
Optionally override via AGE_GENDER_MODEL_DIR env var.
"""
_default_age_gender_dir = os.path.join(os.path.dirname(__file__), "Age-and-Gender-prediction-model-based-on-text")
age_gender_model_dir = os.getenv("AGE_GENDER_MODEL_DIR", _default_age_gender_dir)
_age_model = None
_gender_model = None
_tfidf_vectorizer = None
_stop_words = set()
_age_gender_lock = threading.Lock()

def _init_age_gender_models():
    """Attempt to load sklearn RF models; if absent, fall back to Keras NN models. - DISABLED"""
    global AGE_GENDER_AVAILABLE, _age_model, _gender_model, _tfidf_vectorizer
    print("Age/Gender prediction models DISABLED")
    return  # DISABLED - early return
    if AGE_GENDER_AVAILABLE:
        return
    import os
    try:
        import joblib, nltk
        # Ensure NLTK data
        for pkg in ('stopwords', 'punkt'):
            try:
                nltk.data.find(f'corpora/{pkg}' if pkg == 'stopwords' else f'tokenizers/{pkg}')
            except LookupError:
                nltk.download(pkg, quiet=True)
        # Primary (RandomForest) model files
        rf_vect = os.path.join(age_gender_model_dir, 'tfidf_vectorizer.pkl')
        rf_age = os.path.join(age_gender_model_dir, 'age_model.pkl')
        rf_gender = os.path.join(age_gender_model_dir, 'gender_model.pkl')
        if os.path.exists(rf_vect) and os.path.exists(rf_age) and os.path.exists(rf_gender):
            print("Loading sklearn age/gender models...")
            _tfidf_vectorizer = joblib.load(rf_vect)
            _age_model = joblib.load(rf_age)
            _gender_model = joblib.load(rf_gender)
            _age_model.is_nn = False  # flag
            _gender_model.is_nn = False
            AGE_GENDER_AVAILABLE = True
            print("Sklearn age/gender models loaded.")
            return
        # Fallback: Neural Network models
        nn_vect = os.path.join(age_gender_model_dir, 'tfidf_vectorizer_nn.pkl')
        nn_age = os.path.join(age_gender_model_dir, 'age_model_nn.keras')
        nn_gender = os.path.join(age_gender_model_dir, 'gender_model_nn.keras')
        if os.path.exists(nn_vect) and os.path.exists(nn_age) and os.path.exists(nn_gender):
            print("Loading Keras NN age/gender models...")
            _tfidf_vectorizer = joblib.load(nn_vect)
            import tensorflow as tf
            _age_model = tf.keras.models.load_model(nn_age)
            _gender_model = tf.keras.models.load_model(nn_gender)
            _age_model.is_nn = True
            _gender_model.is_nn = True
            AGE_GENDER_AVAILABLE = True
            print("Keras NN age/gender models loaded.")
        else:
            print(f"No age/gender models found in {age_gender_model_dir} (sklearn or NN).")
    except Exception as e:
        print(f"Warning: Age/Gender prediction unavailable: {e}")
        AGE_GENDER_AVAILABLE = False

def _ensure_stopwords():
    global _stop_words
    if _stop_words:
        return
    try:
        from nltk.corpus import stopwords
        _stop_words = set(stopwords.words('english'))
    except Exception:
        _stop_words = set()

def _preprocess_age_gender_text(text: str) -> str:
    import re
    _ensure_stopwords()
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'\W+', ' ', text)
    text = text.lower()
    try:
        from nltk.tokenize import word_tokenize
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 2]
    return ' '.join(tokens)

def predict_age_gender_from_text(text: str):
    if not AGE_GENDER_AVAILABLE or not text or len(text.strip()) < 10:
        return {
            "age": None,
            "age_confidence": 0.0,
            "gender": None,
            "gender_confidence": 0.0,
            "available": False
        }
    try:
        processed = _preprocess_age_gender_text(text)
        if not processed:
            return {
                "age": None,
                "age_confidence": 0.0,
                "gender": None,
                "gender_confidence": 0.0,
                "available": False
            }
        vect = _tfidf_vectorizer.transform([processed])
        age_map = {0: '<20', 1: '21-30', 2: '30+'}
        if getattr(_age_model, 'is_nn', False):
            # NN expects dense array
            dense = vect.toarray()
            import numpy as np
            age_probs = _age_model.predict(dense, verbose=0)[0]
            age_pred = int(np.argmax(age_probs))
            gender_prob_arr = _gender_model.predict(dense, verbose=0)[0]
            # gender_prob_arr shape could be (1,) or scalar
            gender_prob = float(gender_prob_arr[0]) if hasattr(gender_prob_arr, '__len__') else float(gender_prob_arr)
            gender_pred_label = 'male' if gender_prob >= 0.5 else 'female'
            gender_confidence = gender_prob if gender_pred_label == 'male' else (1 - gender_prob)
            return {
                "age": age_map.get(age_pred),
                "age_confidence": float(max(age_probs) * 100.0),
                "gender": gender_pred_label,
                "gender_confidence": round(gender_confidence * 100.0, 2),
                "available": True
            }
        else:
            age_pred = _age_model.predict(vect)[0]
            age_proba = _age_model.predict_proba(vect)[0]
            gender_pred = _gender_model.predict(vect)[0]
            gender_proba = _gender_model.predict_proba(vect)[0]
            return {
                "age": age_map.get(int(age_pred), None),
                "age_confidence": float(max(age_proba) * 100.0),
                "gender": str(gender_pred),
                "gender_confidence": float(max(gender_proba) * 100.0),
                "available": True
            }
    except Exception as e:
        print(f"Age/Gender prediction error: {e}")
        return {
            "age": None,
            "age_confidence": 0.0,
            "gender": None,
            "gender_confidence": 0.0,
            "available": False,
            "error": str(e)
        }

_init_age_gender_models()

# Unified text preprocessing matching training (HTML removal, non-word filtering, lowercasing, tokenization, stopword removal)
def preprocess_for_models(text: str) -> str:
    if not text:
        return ""
    import re
    _ensure_stopwords()
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'\W+', ' ', text)
    text = text.lower()
    try:
        from nltk.tokenize import word_tokenize
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 2]
    return ' '.join(tokens)


import random
import os


# iProyal proxy configuration - simple rotating format without sessions
# Sessions can expire, so we use the simpler rotating format
IPROYAL_PROXY = "http://jokubelis:brancaleonas_country-us@geo.iproyal.com:11200"

def get_random_proxy():
    """Get the iProyal rotating proxy (rotates automatically per request)"""
    return IPROYAL_PROXY

# Rotating user agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
]

# Global bandwidth tracking
bandwidth_stats = {
    "total_bytes": 0,
    "request_count": 0
}
bandwidth_lock = threading.Lock()

def apirequest(url):
    request_headers = {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json, text/plain, */*",  # Text only, no images
        "Referer": "https://www.reddit.com/",
        "Connection": "keep-alive"
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                time.sleep(2 ** attempt)  # Exponential backoff
            
            # Get fresh proxy for each attempt
            proxy_url = get_random_proxy()
            proxies = {"http": proxy_url, "https": proxy_url}
            
            # Use proxy for all requests
            res = requests.get(url, headers=request_headers, proxies=proxies, timeout=30)
            
            if res.status_code == 200:
                # Track bandwidth (request + response)
                request_size = len(url) + sum(len(f"{k}: {v}") for k, v in request_headers.items())
                response_size = len(res.content)
                total_size = request_size + response_size
                
                with bandwidth_lock:
                    bandwidth_stats["total_bytes"] += total_size
                    bandwidth_stats["request_count"] += 1
                
                try:
                    return res.json(), total_size
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode JSON from {url}. Content preview: {res.text[:500]}")
                    raise
            elif res.status_code == 429:  # Rate limited
                time.sleep(5)
                continue
            else:
                res.raise_for_status()
                
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2)
    
    raise Exception("Failed after retries")


def resolve_parent_authors(comments):
    """Resolve parent comment authors for all comments that are replies to other comments.
    
    Reddit comments have a parent_id field:
      - t1_xxx = reply to another comment (we need to resolve the author)
      - t3_xxx = reply to a post (use link_author, the post OP)
    
    We batch-fetch parent comments via /api/info.json?id=t1_a,t1_b,...
    Returns a dict mapping parent_id -> author username.
    """
    # Collect all t1_ parent IDs (replies to comments, not posts)
    parent_ids = set()
    for comment in comments:
        data = comment.get("data", {})
        parent_id = data.get("parent_id", "")
        if parent_id.startswith("t1_"):
            parent_ids.add(parent_id)
    
    if not parent_ids:
        logger.info("No parent comments to resolve (all are top-level)")
        return {}
    
    logger.info(f"Resolving {len(parent_ids)} parent comment authors...")
    parent_author_map = {}
    
    # Batch fetch in groups of 100 (Reddit API limit)
    parent_id_list = list(parent_ids)
    batch_size = 100
    
    for i in range(0, len(parent_id_list), batch_size):
        batch = parent_id_list[i:i + batch_size]
        ids_param = ",".join(batch)
        url = f"https://www.reddit.com/api/info.json?id={ids_param}"
        
        try:
            data, size = apirequest(url)
            children = data.get("data", {}).get("children", [])
            for child in children:
                child_data = child.get("data", {})
                full_name = child_data.get("name", "")  # e.g. t1_abc123
                author = child_data.get("author", "")
                if full_name and author:
                    parent_author_map[full_name] = author
            
            logger.info(f"Resolved batch {i // batch_size + 1}: {len(children)} parents")
            time.sleep(0.3)  # Rate limit between batches
        except Exception as e:
            logger.error(f"Failed to resolve parent batch {i // batch_size + 1}: {e}")
            continue
    
    logger.info(f"Resolved {len(parent_author_map)} / {len(parent_ids)} parent authors")
    return parent_author_map


def populate_dics(username, option):
    switch = {
        "c": "comments",
        "s": "submitted"
    }
    
    # Use www.reddit.com with .json for full data including removed content markers
    url = f"https://www.reddit.com/user/{username}/{switch[option]}.json?limit=100&after="
    lst = []
    total = 0
    name = ""
    bandwidth_used = 0
    start_time = time.time()
    
    while True:
        # Check timeout (300 seconds per type)
        if time.time() - start_time > 300:
            logger.info(f"Timeout reached for {option} (username: {username})")
            break
            
        data, size = apirequest(url + name)
        bandwidth_used += size
        num = int(data['data']['dist'])
        total += num
        if num == 0:
            break
        for entry in data['data']['children']:
            lst.append(entry)
        
        name = data['data']['children'][num - 1]['data']['name']
        time.sleep(0.2)  # Reduced from 0.5s to 0.2s for faster scraping
    
    return lst, bandwidth_used


def populate_overview(username):
    """Fetch user overview which contains both comments and submissions mixed"""
    url = f"https://www.reddit.com/user/{username}/overview.json?limit=100&after="
    lst = []
    name = ""
    bandwidth_used = 0
    start_time = time.time()
    
    while True:
        if time.time() - start_time > 300:
            logger.info(f"Timeout reached for overview (username: {username})")
            break
            
        data, size = apirequest(url + name)
        bandwidth_used += size
        num = int(data['data']['dist'])
        if num == 0:
            break
        for entry in data['data']['children']:
            lst.append(entry)
        
        name = data['data']['children'][num - 1]['data']['name']
        time.sleep(0.2)
    
    return lst, bandwidth_used

def sort_data(dic):
    sorted_list = [[], []]
    for pair in reversed(sorted(dic.items(), key=itemgetter(1))):
        sorted_list[0].append(pair[0])
        sorted_list[1].append(pair[1])
    return sorted_list

def filter_data(lst, keyname):
    dic = {}
    for entry in lst:
        domain = entry['data'][keyname]
        if domain not in dic.keys():
            dic[domain] = 1
        else:
            dic[domain] += 1
    return dic

def difference_from_unixtime(timestamp):
    # Use timezone.utc for broader Python version compatibility (<3.11 doesn't expose datetime.UTC)
    unixinnormal = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)
    current_time = datetime.datetime.now(datetime.timezone.utc)
    d = (current_time - unixinnormal)
    days = d.days
    seconds = d.seconds

    years = int(days / 365)
    days -= int(years * 365)

    hours = int(seconds / 3600)
    seconds -= int(3600 * hours)
    minutes = int(seconds / 60)
    seconds -= int(60 * minutes)
    
    if years <= 0:
        if days <= 0:
            if hours <= 0:
                if minutes <= 0:
                    return f"{seconds} seconds"
                return f"{str(minutes).zfill(2)} minutes"
            return f"{str(hours).zfill(2)}:{str(minutes).zfill(2)} hours"
        return f"{days} days, {str(hours).zfill(2)}:{str(minutes).zfill(2)} hours"
    else:
        return f"{years} Years, {days} days, {str(hours).zfill(2)}:{str(minutes).zfill(2)} hours"

def get_activity_by_time(commentlist, submissionlist):
    hourdic = {f"{str(h).zfill(2)}:00": 0 for h in range(24)}
    weekdaydic = {i: 0 for i in range(7)}
    
    for comment in commentlist:
        time_obj = datetime.datetime.fromtimestamp(comment['data']['created_utc'], datetime.timezone.utc)
        hour = str(time_obj.hour).zfill(2) + ":00"
        weekdaydic[time_obj.weekday()] += 1
        hourdic[hour] += 1
    
    for submission in submissionlist:
        time_obj = datetime.datetime.fromtimestamp(submission['data']['created_utc'], datetime.timezone.utc)
        hour = str(time_obj.hour).zfill(2) + ":00"
        weekdaydic[time_obj.weekday()] += 1
        hourdic[hour] += 1
    
    # Convert to list format for easier frontend consumption
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday_data = [{"day": weekdays[k], "count": v} for k, v in weekdaydic.items()]
    hour_data = [{"hour": k, "count": v} for k, v in hourdic.items()]
    
    return hour_data, weekday_data

def predict_personality(text):
    """
    Predict Big 5 personality traits from text using BERT model
    Returns dict with scores for each trait (0-1 scale)
    """
    if not PERSONALITY_AVAILABLE or not text or len(text.strip()) == 0:
        return {
            "Extroversion": 0.5,
            "Neuroticism": 0.5,
            "Agreeableness": 0.5,
            "Conscientiousness": 0.5,
            "Openness": 0.5,
            "available": False
        }
    
    try:
        # Truncate text if too long (BERT has max token limit)
        max_chars = 10000  # Reasonable limit
        if len(text) > max_chars:
            text = text[:max_chars]
        
        inputs = personality_tokenizer(text, truncation=True, padding=True, return_tensors="pt", max_length=512)
        
        with torch.no_grad():
            outputs = personality_model(**inputs)
            predictions = torch.sigmoid(outputs.logits).squeeze().numpy()
        
        # Ensure predictions is array-like
        if not hasattr(predictions, '__len__'):
            predictions = [predictions]
        
        result = {
            "Extroversion": float(predictions[0]),
            "Neuroticism": float(predictions[1]),
            "Agreeableness": float(predictions[2]),
            "Conscientiousness": float(predictions[3]),
            "Openness": float(predictions[4]),
            "available": True
        }
        
        return result
    except Exception as e:
        print(f"Error in personality prediction: {e}")
        return {
            "Extroversion": 0.5,
            "Neuroticism": 0.5,
            "Agreeableness": 0.5,
            "Conscientiousness": 0.5,
            "Openness": 0.5,
            "available": False,
            "error": str(e)
        }

def average(lst):
    return float(sum(lst)) / len(lst) if len(lst) > 0 else 0

def get_average_scores(commentlist, submissionlist):
    comment_avg = 0
    submission_avg = 0
    
    if len(commentlist) > 0:
        commentscores = [comment['data']['score'] for comment in commentlist]
        comment_avg = average(commentscores)
    
    if len(submissionlist) > 0:
        subscores = [sub['data']['score'] for sub in submissionlist]
        submission_avg = average(subscores)
    
    return comment_avg, submission_avg

def format_top_list(sorted_data, top=5):
    """Format sorted data into a list of dicts with name, count, and percentage"""
    if len(sorted_data[0]) == 0:
        return []
    
    total = sum(sorted_data[1])
    result = []
    limit = min(top if top > 0 else len(sorted_data[0]), len(sorted_data[0]))
    
    for i in range(limit):
        result.append({
            "name": sorted_data[0][i],
            "count": sorted_data[1][i],
            "percentage": round((sorted_data[1][i] / total * 100), 1) if total > 0 else 0
        })
    
    return result

def new_shelffile(username):
    # Fetch comments and submissions in parallel with 2 workers
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_comments = executor.submit(populate_dics, username, "c")
        future_submissions = executor.submit(populate_dics, username, "s")
        
        comments, comments_bw = future_comments.result()
        submissions, submissions_bw = future_submissions.result()
    
    total_bandwidth = comments_bw + submissions_bw
    
    # Resolve parent comment authors before formatting
    logger.info(f"Resolving parent authors for {username}...")
    parent_author_map = resolve_parent_authors(comments)
    
    # Format comments and posts in parallel using 4 workers for faster processing
    logger.info(f"Formatting data for {username} in parallel...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Split comments into chunks for parallel processing
        chunk_size = max(1, len(comments) // 4)
        comment_chunks = [comments[i:i+chunk_size] for i in range(0, len(comments), chunk_size)]
        
        # Split submissions into chunks
        sub_chunk_size = max(1, len(submissions) // 4)
        submission_chunks = [submissions[i:i+sub_chunk_size] for i in range(0, len(submissions), sub_chunk_size)]
        
        # Process all chunks in parallel (pass parent_author_map to format_comments)
        comment_futures = [executor.submit(format_comments, chunk, parent_author_map) for chunk in comment_chunks if chunk]
        submission_futures = [executor.submit(format_posts, chunk) for chunk in submission_chunks if chunk]
        
        # Collect results
        formatted_comments = []
        for future in comment_futures:
            formatted_comments.extend(future.result())
        
        formatted_posts = []
        for future in submission_futures:
            formatted_posts.extend(future.result())
    
    logger.info(f"Parallel formatting complete for {username}")
    
    # TEMPORARILY DISABLED: Shelf caching causing issues with multiple workers
    # Just return both raw and formatted data for efficiency
    logger.info(f"Fetched data for {username}: {len(comments)} comments, {len(submissions)} submissions")
    return comments, submissions, total_bandwidth, formatted_comments, formatted_posts

def get_cached_data(username):
    # TEMPORARILY DISABLED: Shelf caching causing issues
    # Always fetch fresh data for now
    logger.info(f"Fetching fresh data for {username}")
    return new_shelffile(username)

def extract_emojis(text):
    """Extract emojis from text"""
    if not text:
        return None
    import re
    # Unicode ranges for emojis
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE)
    emojis = emoji_pattern.findall(text)
    return emojis if emojis else None

def analyze_sentiment(text):
    """Analyze sentiment of text using spaCy and TextBlob"""
    if not SENTIMENT_AVAILABLE or not text or len(text.strip()) == 0:
        return {
            "polarity": 0.0,
            "subjectivity": 0.0,
            "sentiment_label": "neutral"
        }
    
    try:
        doc = nlp(text[:5000])  # Limit to 5000 chars for performance
        polarity = doc._.blob.polarity  # -1 (negative) to 1 (positive)
        subjectivity = doc._.blob.subjectivity  # 0 (objective) to 1 (subjective)
        
        # Classify sentiment
        if polarity > 0.1:
            sentiment_label = "positive"
        elif polarity < -0.1:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        return {
            "polarity": round(polarity, 3),
            "subjectivity": round(subjectivity, 3),
            "sentiment_label": sentiment_label
        }
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return {
            "polarity": 0.0,
            "subjectivity": 0.0,
            "sentiment_label": "neutral"
        }

def extract_entities(text):
    """Extract named entities from text using Spacy (lighter than BERT)"""
    if not SENTIMENT_AVAILABLE or not text or len(text.strip()) == 0:
        return {
            "locations": [],
            "persons": [],
            "organizations": [],
            "all_entities": []
        }
    
    try:
        # Use Spacy for NER
        doc = nlp(text[:5000])
        
        locations = []
        persons = []
        organizations = []
        all_entities = []
        
        for ent in doc.ents:
            entity_info = {
                "text": ent.text,
                "word": ent.text, # For compatibility
                "score": 1.0, # Spacy doesn't provide confidence scores easily
                "start": ent.start_char,
                "end": ent.end_char,
                "entity_group": "MISC"
            }
            
            if ent.label_ in ("GPE", "LOC"):
                entity_info["entity_group"] = "LOC"
                locations.append(entity_info)
            elif ent.label_ == "PERSON":
                entity_info["entity_group"] = "PER"
                persons.append(entity_info)
            elif ent.label_ == "ORG":
                entity_info["entity_group"] = "ORG"
                organizations.append(entity_info)
            else:
                entity_info["entity_group"] = "MISC"
            
            all_entities.append(entity_info)
        
        return {
            "locations": locations,
            "persons": persons,
            "organizations": organizations,
            "all_entities": all_entities
        }
    except Exception as e:
        print(f"NER extraction error: {e}")
        return {
            "locations": [],
            "persons": [],
            "organizations": [],
            "all_entities": []
        }

def format_comments(comments, parent_author_map=None):
    """Format comments according to specified structure"""
    if parent_author_map is None:
        parent_author_map = {}
    formatted = []
    for index, comment in enumerate(comments):
        # Extract data from Reddit API structure
        data = comment.get("data", {})
        body = data.get("body", "")

        # Clean text (match training preprocessing)
        cleaned = preprocess_for_models(body)
        
        # Build full Reddit URL from permalink
        permalink = data.get("permalink", "")
        url = f"https://reddit.com{permalink}" if permalink else None
        
        # Analyze sentiment - DISABLED
        sentiment = None  # analyze_sentiment(body)
        
        # Extract named entities - DISABLED
        entities = None  # extract_entities(body)
        
        # Resolve who this comment is responding to:
        # - If parent_id starts with t1_ (reply to comment), use resolved parent author
        # - If parent_id starts with t3_ (reply to post), use link_author (the OP)
        parent_id = data.get("parent_id", "")
        if parent_id.startswith("t1_") and parent_id in parent_author_map:
            responding_to = parent_author_map[parent_id]
        else:
            responding_to = data.get("link_author", "")
        
        formatted.append({
            "index": index,
            "comment": body,
            "body": body,  # Raw body for removal detection
            "cleaned_comment": cleaned,
            "timestamp": data.get("created_utc", 0),
            "karma": data.get("score", 0),
            "media": None,  # Comments don't have media in Reddit API
            "emoji": extract_emojis(body),
            "subreddit": data.get("subreddit", ""),
            "responding": responding_to,
            "url": url,
            "sentiment": sentiment,
            "entities": entities,
            # Removal detection fields
            "removed_by_category": data.get("removed_by_category"),
            "banned_by": data.get("banned_by"),
            "removal_reason": data.get("removal_reason"),
        })
    return formatted

def format_posts(submissions):
    """Format posts according to specified structure"""
    formatted = []
    for index, post in enumerate(submissions):
        # Extract data from Reddit API structure
        data = post.get("data", {})
        
        # Check for media
        media = None
        if data.get("url"):
            url = data.get("url", "")
            # Check if URL is an image/video
            if any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.gifv', '.mp4', '.webm']):
                media = url
            elif 'v.redd.it' in url or 'youtube.com' in url or 'youtu.be' in url:
                media = url
        
        # Use ONLY title for analysis as requested
        text_content = data.get("title", "")
        cleaned = preprocess_for_models(text_content)
        
        # Get flair
        flair = data.get("link_flair_text", None)
        
        # Build full Reddit URL from permalink
        permalink = data.get("permalink", "")
        url = f"https://reddit.com{permalink}" if permalink else None
        
        # Analyze sentiment - DISABLED
        sentiment = None  # analyze_sentiment(text_content)
        
        # Extract named entities - DISABLED
        entities = None  # extract_entities(text_content)
        
        formatted.append({
            "index": index,
            "post": text_content,
            "cleaned_post_title": cleaned,
            "timestamp": data.get("created_utc", 0),
            "karma": data.get("score", 0),
            "media": media,
            "emoji": extract_emojis(text_content),
            "subreddit": data.get("subreddit", ""),
            "flair": flair,
            "url": url,
            "sentiment": sentiment,
            "entities": entities,
            # Removal detection fields
            "selftext": data.get("selftext", ""),  # Raw selftext for removal detection
            "removed_by_category": data.get("removed_by_category"),
            "banned_by": data.get("banned_by"),
            "removal_reason": data.get("removal_reason"),
        })
    return formatted

def get_hashed_filename(username):
    """Generate base64 hashed filename for username"""
    # Create hash of username
    username_bytes = username.lower().encode('utf-8')
    hash_object = hashlib.sha256(username_bytes)
    hash_hex = hash_object.hexdigest()
    
    # Convert to base64
    hash_base64 = base64.urlsafe_b64encode(hash_hex.encode('utf-8')).decode('utf-8')
    
    # Remove padding characters
    hash_base64 = hash_base64.rstrip('=')
    
    return f"{hash_base64}.json"

def load_existing_user_data(username):
    """Load existing user data from JSON file if it exists"""
    folder = "reddituser"
    filename = get_hashed_filename(username)
    filepath = os.path.join(folder, filename)
    
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None
    return None

def get_newest_timestamp(items):
    """Get the newest timestamp from a list of items"""
    if not items:
        return 0
    timestamps = [item.get('timestamp', 0) for item in items]
    return max(timestamps) if timestamps else 0

def fetch_new_items_only(username, item_type, since_timestamp):
    """Fetch only new items (comments or posts) since a given timestamp"""
    # Add .json extension to get JSON response instead of HTML
    url = f"https://www.reddit.com/user/{username}/{item_type}.json"
    new_items = []
    bandwidth_used = 0
    after = None
    
    while True:
        request_url = f"{url}?limit=100"
        if after:
            request_url += f"&after={after}"
        
        try:
            data, bw = apirequest(request_url)
            bandwidth_used += bw
            
            items = data['data']['children']
            if not items:
                break
            
            # Check timestamps and stop if we've reached old content
            for item in items:
                item_timestamp = item['data'].get('created_utc', 0)
                if item_timestamp > since_timestamp:
                    new_items.append(item)
                else:
                    # Reached old content, stop fetching
                    return new_items, bandwidth_used
            
            after = data['data']['after']
            if not after:
                break
                
        except Exception as e:
            print(f"Error fetching new {item_type}: {e}")
            break
    
    return new_items, bandwidth_used

def save_user_data(username, data):
    """Save user data to JSON file in reddituser folder"""
    # Create reddituser folder if it doesn't exist
    folder = "reddituser"
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    # Get hashed filename
    filename = get_hashed_filename(username)
    filepath = os.path.join(folder, filename)
    
    # Save data as JSON
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return filepath

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "version": __version__}), 200

@app.route('/save-uncategorized', methods=['POST', 'OPTIONS'])
def save_uncategorized_subreddits():
    """
    Save uncategorized subreddits to JSON file
    POST body: {
        "subreddits": {"subreddit_name": {"firstSeen": "...", "lastSeen": "...", "count": 1}, ...}
    }
    """
    if request.method == 'OPTIONS':
        # Preflight CORS request
        response = app.make_default_options_response()
        return response
    
    try:
        data = request.get_json()
        if not data or 'subreddits' not in data:
            return jsonify({"error": "Missing 'subreddits' in request body"}), 400
        
        # Path to the JSON file
        file_path = os.path.join(os.path.dirname(__file__), '..', 'reddituser_v2', 'src', 'data', 'uncategorized_subreddits.json')
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Read existing data
        existing = {}
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    existing = json.load(f)
            except:
                pass
        
        # Merge with new data (overwrites duplicates with newer data)
        for sub, info in data['subreddits'].items():
            if sub in existing:
                # Keep earliest firstSeen, use latest lastSeen, sum counts
                existing[sub]['lastSeen'] = info['lastSeen']
                existing[sub]['count'] = info.get('count', 1)
            else:
                existing[sub] = info
        
        # Write back to file
        with open(file_path, 'w') as f:
            json.dump(existing, f, indent=2)
        
        logger.info(f"Saved {len(data['subreddits'])} uncategorized subreddits. Total: {len(existing)}")
        return jsonify({
            "success": True,
            "saved": len(data['subreddits']),
            "total": len(existing)
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving uncategorized subreddits: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST','OPTIONS'])
def analyze_user():
    """
    Analyze a Reddit user - scrapes ALL comments and posts
    POST body: {
        "username": "reddit_username",
        "top": 5,  // How many top entries to show in lists (0 = all)
        "include_raw": false  // If true, includes all raw comment/post data
    }
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        logger.debug("/analyze preflight OPTIONS received: headers=%s", dict(request.headers))
        return jsonify({"status": "ok"}), 200
    try:
        # Robust JSON parsing: attempt Flask's parser silently, then fallback to manual json.loads on raw body.
        logger.info("/analyze request started ip=%s ct=%s len_body=%s", request.remote_addr, request.content_type, len(request.data or b''))
        data = request.get_json(silent=True)
        if data is None:
            raw_body = request.data
            if raw_body:
                try:
                    data = json.loads(raw_body.decode('utf-8'))
                except Exception:
                    data = None
        if data is None:
            # Debug log to help diagnose malformed JSON issues
            logger.warning("/analyze JSON parse failed headers=%s raw_prefix=%r", dict(request.headers), request.data[:200])
        
        if not data or 'username' not in data:
            logger.warning("/analyze missing username; data_keys=%s", list(data.keys()) if isinstance(data, dict) else None)
            return jsonify({"error": "Username is required"}), 400
        
        username = data['username'].lower()  # Normalize to lowercase for consistency
        top = data.get('top', 5)
        include_raw = data.get('include_raw', False)  # Include all raw comments/posts
        force_full_scrape = data.get('force_full_scrape', False)  # Force full rescrape
        
        # Track bandwidth for this request
        request_bandwidth = 0
        is_incremental_update = False
        
        # Get account stats
        try:
            accountstats, bw = apirequest(f"https://api.reddit.com/user/{username}/about")
            request_bandwidth += bw
            logger.debug("Fetched account stats for %s bw_bytes=%s", username, bw)
        except Exception as e:
            logger.error("Failed to fetch user data for %s error=%s", username, e, exc_info=True)
            return jsonify({"error": f"Failed to fetch user data: {str(e)}"}), 404
        
        # Check if we have existing data and can do incremental update
        existing_data = load_existing_user_data(username) if not force_full_scrape else None
        
        if existing_data and 'comments' in existing_data and 'posts' in existing_data:
            # Incremental update - only fetch new items
            is_incremental_update = True
            logger.info("Incremental update for %s", username)
            
            # Get latest timestamps from existing data
            latest_comment_timestamp = get_newest_timestamp(existing_data['comments'])
            latest_post_timestamp = get_newest_timestamp(existing_data['posts'])
            
            # Fetch only new items in parallel
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                future_comments = executor.submit(fetch_new_items_only, username, 'comments', latest_comment_timestamp)
                future_posts = executor.submit(fetch_new_items_only, username, 'submitted', latest_post_timestamp)
                
                new_comments_raw, comments_bw = future_comments.result()
                new_posts_raw, posts_bw = future_posts.result()
            
            request_bandwidth += comments_bw + posts_bw
            logger.debug("Fetched incremental new_items comments=%s posts=%s bw=%s", len(new_comments_raw), len(new_posts_raw), comments_bw + posts_bw)
            
            # Format new items (resolve parent authors first)
            new_parent_author_map = resolve_parent_authors(new_comments_raw)
            new_comments_formatted = format_comments(new_comments_raw, new_parent_author_map)
            new_posts_formatted = format_posts(new_posts_raw)
            
            # Merge with existing data (prepend new items to keep chronological order)
            comments_formatted = new_comments_formatted + existing_data['comments']
            posts_formatted = new_posts_formatted + existing_data['posts']
            
            # Re-index after merging
            for i, comment in enumerate(comments_formatted):
                comment['index'] = i
            for i, post in enumerate(posts_formatted):
                post['index'] = i
            
            # Store raw data for later processing (use raw data from existing file)
            comments = new_comments_raw + existing_data.get('raw_data', {}).get('comments', [])
            submissions = new_posts_raw + existing_data.get('raw_data', {}).get('submissions', [])
        else:
            # Full scrape - get all data (now includes formatted data from parallel processing)
            comments, submissions, data_bandwidth, comments_formatted, posts_formatted = get_cached_data(username)
            request_bandwidth += data_bandwidth
            logger.info("Full scrape for %s comments=%s submissions=%s bw=%s", username, len(comments), len(submissions), data_bandwidth)
        
        # Calculate stats
        total_karma = int(accountstats['data']['comment_karma']) + int(accountstats['data']['link_karma'])
        
        account_info = {
            "username": accountstats['data']['name'],
            "total_karma": total_karma,
            "comment_karma": accountstats['data']['comment_karma'],
            "post_karma": accountstats['data']['link_karma'],
            "comment_karma_percentage": round((accountstats['data']['comment_karma'] / total_karma * 100), 1) if total_karma > 0 else 0,
            "post_karma_percentage": round((accountstats['data']['link_karma'] / total_karma * 100), 1) if total_karma > 0 else 0,
            # Use timezone.utc for compatibility across Python versions (datetime.UTC may not exist <3.11)
            "account_created": datetime.datetime.fromtimestamp(accountstats['data']['created_utc'], datetime.timezone.utc).isoformat(),
            "account_age": difference_from_unixtime(accountstats['data']['created_utc']),
            "total_comments": len(comments),
            "total_submissions": len(submissions),
            "icon_img": accountstats['data'].get('icon_img', '').split('?')[0] if accountstats['data'].get('icon_img') else '',
            "snoovatar_img": accountstats['data'].get('snoovatar_img', '').split('?')[0] if accountstats['data'].get('snoovatar_img') else ''
        }
        
        # Activity charts
        hour_activity, weekday_activity = get_activity_by_time(comments, submissions)
        
        # Top subreddits
        top_subreddits_comments = []
        top_subreddits_posts = []
        if len(comments) > 0:
            top_subreddits_comments = format_top_list(sort_data(filter_data(comments, "subreddit")), top)
        if len(submissions) > 0:
            top_subreddits_posts = format_top_list(sort_data(filter_data(submissions, "subreddit")), top)
        
        # Top domains
        top_domains = []
        if len(submissions) > 0:
            top_domains = format_top_list(sort_data(filter_data(submissions, "domain")), top)
        
        # Top people replied to
        top_people = []
        if len(comments) > 0:
            top_people = format_top_list(sort_data(filter_data(comments, "link_author")), top)
        
        # Average scores
        avg_comment_score, avg_submission_score = get_average_scores(comments, submissions)
        
        result = {
            "account_info": account_info,
            "activity": {
                "by_hour": hour_activity,
                "by_weekday": weekday_activity
            },
            "top_subreddits": {
                "by_comments": top_subreddits_comments,
                "by_posts": top_subreddits_posts
            },
            "top_domains": top_domains,
            "top_people_replied_to": top_people,
            "average_scores": {
                "comments": round(avg_comment_score, 1),
                "submissions": round(avg_submission_score, 1)
            }
        }
        
        # Include all raw comments and posts if requested
        if include_raw:
            result["raw_data"] = {
                "comments": comments,
                "submissions": submissions,
                "total_comments": len(comments),
                "total_submissions": len(submissions)
            }
        
        # Add formatted comments and posts
        result["comments"] = comments_formatted
        result["posts"] = posts_formatted
        
        # Add update info
        result["update_info"] = {
            "is_incremental_update": is_incremental_update,
            "new_comments_fetched": len(new_comments_formatted) if is_incremental_update else len(comments_formatted),
            "new_posts_fetched": len(new_posts_formatted) if is_incremental_update else len(posts_formatted)
        }
        
        # Add bandwidth information
        result["bandwidth"] = {
            "bytes_used": request_bandwidth,
            "kb_used": round(request_bandwidth / 1024, 2),
            "mb_used": round(request_bandwidth / (1024 * 1024), 2),
            "estimated_cost_usd": round(request_bandwidth / (1024 * 1024 * 1024) * 7.5, 4)  # Assuming ~$7.5/GB for residential proxy
        }
        
        # Add personality prediction
        if PERSONALITY_AVAILABLE and (len(comments_formatted) > 0 or len(posts_formatted) > 0):
            logger.info("Running personality prediction for %s", username)
            # Combine cleaned comments and cleaned post titles only
            all_text = " ".join([
                c.get("cleaned_comment", "") for c in comments_formatted if c.get("cleaned_comment")
            ]) + " " + " ".join([
                p.get("cleaned_post_title", "") for p in posts_formatted if p.get("cleaned_post_title")
            ])
            
            if len(all_text.strip()) > 0:
                personality_scores = predict_personality(all_text)
                result["personality"] = personality_scores
                logger.debug("Personality prediction done for %s", username)
            else:
                logger.warning("Personality prediction skipped for %s: No text content available after preprocessing", username)
                result["personality"] = {
                    "Extroversion": 0.5,
                    "Neuroticism": 0.5,
                    "Agreeableness": 0.5,
                    "Conscientiousness": 0.5,
                    "Openness": 0.5,
                    "available": False
                }
        else:
            if not PERSONALITY_AVAILABLE:
                logger.warning("Personality prediction skipped for %s: Model not available", username)
            else:
                logger.warning("Personality prediction skipped for %s: No comments or posts found", username)
                
            result["personality"] = {
                "Extroversion": 0.5,
                "Neuroticism": 0.5,
                "Agreeableness": 0.5,
                "Conscientiousness": 0.5,
                "Openness": 0.5,
                "available": False
            }

        # Add aggregated age/gender prediction (combined comment text)
        if AGE_GENDER_AVAILABLE and (len(comments_formatted) > 0 or len(posts_formatted) > 0):
            logger.info("Running age/gender prediction for %s", username)
            combined_text = " ".join([
                c.get("cleaned_comment", "") for c in comments_formatted if c.get("cleaned_comment")
            ]) + " " + " ".join([
                p.get("cleaned_post_title", "") for p in posts_formatted if p.get("cleaned_post_title")
            ])
            if len(combined_text) > 50000:
                combined_text = combined_text[:50000]
            age_gender_scores = predict_age_gender_from_text(combined_text)
            result["age_gender"] = age_gender_scores
            logger.debug("Age/gender prediction result for %s: %s", username, age_gender_scores)
        else:
            result["age_gender"] = {
                "age": None,
                "age_confidence": 0.0,
                "gender": None,
                "gender_confidence": 0.0,
                "available": False
            }
        
        # Sanitize numpy types before JSON serialization (and saving)
        result = _json_sanitize(result)

        # Save data to JSON file
        try:
            filepath = save_user_data(username, result)
            result["saved_to"] = filepath
            logger.debug("Saved user data for %s to %s", username, filepath)
        except Exception as e:
            result["save_error"] = str(e)
            logger.error("Failed saving user data for %s error=%s", username, e, exc_info=True)
        
        logger.info("/analyze completed username=%s incremental=%s bw_bytes=%s", username, is_incremental_update, request_bandwidth)
        return jsonify(result), 200

    except Exception as e:
        # Make sure CORS headers also appear on error responses
        logger.exception("Unhandled error in /analyze: %s", e)
        resp = jsonify({"error": str(e)})
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp, 500

@app.route('/grammar-check', methods=['POST'])
def grammar_check():
    """Check grammar mistakes in provided texts"""
    try:
        if not GRAMMAR_AVAILABLE or grammar_tool is None:
            return jsonify({
                "error": "Grammar checking not available",
                "message": "LanguageTool is not installed or not initialized properly"
            }), 503
        
        data = request.json
        texts = data.get('texts', [])
        language_code = data.get('language', 'auto')  # Get language from request, default to auto-detect
        
        if not texts or not isinstance(texts, list):
            return jsonify({"error": "Please provide 'texts' as an array of text items"}), 400
        
        # Map common language codes to LanguageTool codes
        lang_map = {
            'eng': 'en-US',
            'nld': 'nl',
            'fra': 'fr',
            'deu': 'de',
            'spa': 'es',
            'ita': 'it',
            'por': 'pt',
            'rus': 'ru',
            'jpn': 'ja',
            'zho': 'zh',
            'ara': 'ar',
            'hin': 'hi',
            'auto': 'auto'
        }
        
        # Get the appropriate LanguageTool language code
        lt_language = lang_map.get(language_code, 'auto')
        print(f"Grammar check using language: {language_code} -> {lt_language}")
        
        # Create language-specific tool if needed
        if lt_language != 'auto':
            try:
                # lang_tool = language_tool_python.LanguageTool(lt_language)
                lang_tool = grammar_tool # Fallback since we disabled it
            except:
                # Fall back to auto-detect if specific language not available
                print(f"Language {lt_language} not available, falling back to auto-detect")
                lang_tool = grammar_tool
        else:
            lang_tool = grammar_tool
        
        # Limit to prevent overload
        max_texts = 250
        if len(texts) > max_texts:
            texts = texts[:max_texts]
        
        all_mistakes = []
        
        for idx, item in enumerate(texts):
            text = item.get('text', '')
            if not text or len(text.strip()) < 3:
                continue
            
            # Check grammar with language-specific tool
            try:
                matches = lang_tool.check(text)
                
                for match in matches:
                    # Include all grammar issues
                    mistake = {
                        "error": match.message,
                        "rule": match.rule_id,
                        "category": match.category,
                        "context": match.context,
                        "offset": match.offset,
                        "errorLength": match.error_length,
                        "replacements": match.replacements[:3] if match.replacements else [],
                        "type": item.get('type', 'unknown'),
                        "subreddit": item.get('subreddit', 'unknown'),
                        "karma": item.get('karma', 0),
                        "timestamp": item.get('timestamp', 0),
                        "url": item.get('url', ''),
                        "excerpt": text[max(0, match.offset - 30):min(len(text), match.offset + match.error_length + 30)]
                    }
                    all_mistakes.append(mistake)
                    
                    # Limit mistakes per request
                    if len(all_mistakes) >= 100:
                        break
                
                if len(all_mistakes) >= 100:
                    break
                    
            except Exception as e:
                # Skip texts that cause errors (e.g., too long, unsupported language)
                print(f"Error checking text {idx}: {e}")
                continue
        
        return jsonify({
            "mistakes": all_mistakes,
            "total_mistakes": len(all_mistakes),
            "texts_checked": len(texts),
            "grammar_available": True
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        "name": "Reddit Account Analyzer API",
        "version": __version__,
        "endpoints": {
            "/health": "GET - Health check",
            "/analyze": "POST - Analyze a Reddit user (body: {username: string, top?: number})",
            "/grammar-check": "POST - Check grammar in texts (body: {texts: [{text, type, subreddit, karma}]})",
            "/": "GET - This documentation"
        }
    }), 200



@app.route('/predict-age-gender', methods=['POST'])
def predict_age_gender_endpoint():
    """Predict age and gender for a list of text samples.
    Request JSON body: {"texts": [{"text": "...", "type": "comment", "subreddit": "...", "timestamp": 123,...}]}
    Returns per-text predictions plus aggregate summary.
    """
    try:
        if not AGE_GENDER_AVAILABLE:
            return jsonify({
                "error": "Age/Gender predictor not available",
                "available": False
            }), 503
        data = request.get_json(force=True, silent=True) or {}
        texts = data.get('texts', [])
        if not isinstance(texts, list) or len(texts) == 0:
            return jsonify({"error": "Provide 'texts' as a non-empty list"}), 400
        # Serialize predictions using lock (simple queue / concurrency limiter)
        acquired = _age_gender_lock.acquire(timeout=30)
        if not acquired:
            return jsonify({"error": "Age/Gender predictor busy, try again later", "available": False}), 503
        predictions = []
        try:
            for item in texts:
                text = item.get('text', '')
                if not text or len(text.strip()) < 10:
                    continue
                pred = predict_age_gender_from_text(text)
                predictions.append({
                    "text_preview": (text[:100] + '…') if len(text) > 100 else text,
                    "age": pred.get("age"),
                    "age_confidence": pred.get("age_confidence"),
                    "gender": pred.get("gender"),
                    "gender_confidence": pred.get("gender_confidence"),
                    "available": pred.get("available", False),
                    "url": item.get('url'),
                    "type": item.get('type', 'unknown'),
                    "subreddit": item.get('subreddit'),
                    "timestamp": item.get('timestamp', 0)
                })
        finally:
            _age_gender_lock.release()
        # Aggregate statistics
        if predictions:
            male_count = sum(1 for p in predictions if (p.get('gender') == 'male'))
            female_count = sum(1 for p in predictions if (p.get('gender') == 'female'))
            age_counts = {}
            for p in predictions:
                age_label = p.get('age')
                if age_label:
                    age_counts[age_label] = age_counts.get(age_label, 0) + 1
            avg_gender_conf = round(sum(p.get('gender_confidence', 0.0) for p in predictions) / len(predictions), 2)
            avg_age_conf = round(sum(p.get('age_confidence', 0.0) for p in predictions) / len(predictions), 2)
        else:
            male_count = female_count = 0
            age_counts = {}
            avg_gender_conf = avg_age_conf = 0.0
        return jsonify({
            "predictions": predictions,
            "summary": {
                "total_analyzed": len(predictions),
                "gender": {
                    "male_count": male_count,
                    "female_count": female_count,
                    "male_percentage": round(male_count / len(predictions) * 100, 1) if predictions else 0,
                    "female_percentage": round(female_count / len(predictions) * 100, 1) if predictions else 0,
                    "average_confidence": avg_gender_conf
                },
                "age": {
                    "distribution": age_counts,
                    "average_confidence": avg_age_conf
                }
            },
            "available": True
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Run on all interfaces, port 5001 (5000 often conflicts with AirPlay on macOS)
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
