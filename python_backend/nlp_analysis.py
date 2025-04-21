import re
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from typing import Dict, List, Any, Tuple
from collections import Counter
import string
import textstat
import spacy

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import sys
    import subprocess
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# Technical domain keywords
TECH_DOMAINS = {
    "web_development": [
        "html", "css", "javascript", "react", "angular", "vue", "dom", "api", 
        "frontend", "backend", "responsive", "server", "client", "database", 
        "framework", "component", "routing", "state", "props", "hooks", "redux"
    ],
    "data_science": [
        "python", "pandas", "numpy", "matplotlib", "tensorflow", "keras", "sklearn",
        "regression", "classification", "clustering", "neural network", "machine learning",
        "deep learning", "data", "model", "training", "dataset", "feature", "accuracy"
    ],
    "cloud_computing": [
        "aws", "azure", "gcp", "cloud", "serverless", "container", "docker", "kubernetes",
        "lambda", "ec2", "s3", "microservice", "scaling", "deployment", "infrastructure"
    ],
    "cybersecurity": [
        "encryption", "authentication", "authorization", "vulnerability", "exploit",
        "firewall", "malware", "virus", "phishing", "hacking", "security", "threat",
        "protection", "defense", "attack", "penetration", "testing"
    ]
}

def analyze_transcript(transcript: str) -> Dict[str, Any]:
    """
    Analyze the transcript for various metrics related to technical communication.
    
    Args:
        transcript: The text transcript of the presentation
        
    Returns:
        Dictionary containing various analysis metrics
    """
    # Preprocess text
    clean_text = preprocess_text(transcript)
    sentences = sent_tokenize(clean_text)
    words = word_tokenize(clean_text)
    
    # Basic text stats
    word_count = len(words)
    sentence_count = len(sentences)
    avg_sentence_length = word_count / max(1, sentence_count)
    
    # Calculate complexity metrics
    readability_score = textstat.flesch_reading_ease(clean_text)
    complexity_score = calculate_complexity_score(clean_text)
    
    # Analyze technical content
    domain_scores = analyze_technical_domains(clean_text)
    detected_domain = max(domain_scores.items(), key=lambda x: x[1])[0]
    tech_term_score = min(10.0, domain_scores[detected_domain] * 10)
    
    # Calculate clarity score
    clarity_score = calculate_clarity_score(
        readability_score,
        complexity_score,
        avg_sentence_length
    )
    
    # Find key terms used
    key_terms = extract_key_terms(clean_text, detected_domain)
    
    # Analysis of explanation structure
    explanation_structure = analyze_explanation_structure(sentences)
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_sentence_length": round(avg_sentence_length, 1),
        "readability_score": round(readability_score, 1),
        "complexity_score": round(complexity_score, 1),
        "clarity_score": round(clarity_score, 1),
        "tech_term_score": round(tech_term_score, 1),
        "detected_domain": detected_domain,
        "domain_scores": {k: round(v, 2) for k, v in domain_scores.items()},
        "key_terms_used": key_terms,
        "explanation_structure": explanation_structure
    }

def preprocess_text(text: str) -> str:
    """Clean and normalize text."""
    # Convert to lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(f'[{re.escape(string.punctuation)}]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_complexity_score(text: str) -> float:
    """Calculate a complexity score based on various metrics."""
    # Use textstat for various complexity metrics
    gunning_fog = textstat.gunning_fog(text)
    smog_index = textstat.smog_index(text)
    coleman_liau = textstat.coleman_liau_index(text)
    
    # Normalize to a 0-10 scale
    # Higher is more complex
    normalized_score = (gunning_fog + smog_index + coleman_liau) / 3
    normalized_score = min(10, max(0, normalized_score / 2))
    
    return normalized_score

def analyze_technical_domains(text: str) -> Dict[str, float]:
    """
    Analyze text for technical terms from different domains.
    Returns normalized scores for each domain.
    """
    word_set = set(text.lower().split())
    stop_words = set(stopwords.words('english'))
    word_set = word_set - stop_words
    
    domain_scores = {}
    
    for domain, keywords in TECH_DOMAINS.items():
        # Count occurrences of domain keywords
        domain_term_count = sum(1 for term in keywords if term in text.lower())
        # Normalize by total words and keyword set size
        domain_scores[domain] = domain_term_count / (len(keywords) + 1)
    
    # Normalize scores to sum to 1.0
    total_score = sum(domain_scores.values()) + 0.0001  # Avoid division by zero
    for domain in domain_scores:
        domain_scores[domain] /= total_score
    
    return domain_scores

def calculate_clarity_score(readability: float, complexity: float, avg_sentence_length: float) -> float:
    """
    Calculate a clarity score based on readability, complexity, and sentence length.
    
    Args:
        readability: Flesch Reading Ease score (0-100)
        complexity: Complexity score (0-10)
        avg_sentence_length: Average sentence length
    
    Returns:
        Clarity score (0-10)
    """
    # Normalize readability to 0-10 (higher is better)
    normalized_readability = min(10, readability / 10)
    
    # Penalize overly complex text
    complexity_penalty = max(0, (complexity - 5)) / 2
    
    # Penalize very long or very short sentences
    sentence_length_score = 10 - min(5, abs(avg_sentence_length - 20) / 3)
    
    # Calculate final clarity score
    clarity_score = (normalized_readability * 0.5 + sentence_length_score * 0.5) - complexity_penalty
    clarity_score = max(0, min(10, clarity_score))
    
    return clarity_score

def extract_key_terms(text: str, domain: str) -> List[str]:
    """
    Extract key technical terms used in the transcript.
    
    Args:
        text: Preprocessed transcript text
        domain: Detected technical domain
    
    Returns:
        List of key technical terms used
    """
    # Use domain-specific keywords if available
    domain_terms = set(TECH_DOMAINS.get(domain, []))
    
    # Find terms in text
    doc = nlp(text)
    noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks]
    
    # Extract technical terms
    tech_terms = []
    for term in domain_terms:
        if term in text.lower():
            tech_terms.append(term)
    
    # Add important noun phrases
    for np in noun_phrases:
        if len(np.split()) > 1 and np not in tech_terms:
            for term in domain_terms:
                if term in np:
                    tech_terms.append(np)
                    break
    
    # Limit to top 10 terms
    return tech_terms[:10]

def analyze_explanation_structure(sentences: List[str]) -> Dict[str, Any]:
    """
    Analyze the structure of the explanation.
    
    Args:
        sentences: List of sentences from the transcript
    
    Returns:
        Dictionary with explanation structure metrics
    """
    intro_markers = ["introduce", "overview", "going to", "will be", "today", "talk about"]
    conclusion_markers = ["conclude", "summary", "in conclusion", "finally", "to sum up", "in the end"]
    transition_markers = ["next", "furthermore", "moreover", "additionally", "however", "therefore"]
    
    # Count markers in different parts of the text
    num_sentences = len(sentences)
    intro_section = sentences[:max(1, int(num_sentences * 0.2))]
    conclusion_section = sentences[max(0, int(num_sentences * 0.8)):]
    
    has_intro = any(marker in ' '.join(intro_section).lower() for marker in intro_markers)
    has_conclusion = any(marker in ' '.join(conclusion_section).lower() for marker in conclusion_markers)
    
    transition_count = sum(
        1 for sentence in sentences 
        for marker in transition_markers 
        if marker in sentence.lower()
    )
    
    # Calculate structure quality
    structure_score = 0
    if has_intro:
        structure_score += 3
    if has_conclusion:
        structure_score += 3
    structure_score += min(4, transition_count)
    structure_score = min(10, structure_score)
    
    return {
        "has_introduction": has_intro,
        "has_conclusion": has_conclusion,
        "transition_count": transition_count,
        "structure_score": structure_score
    }