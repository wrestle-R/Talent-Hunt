import os
import numpy as np
import librosa
import parselmouth
from parselmouth.praat import call
from typing import Dict, List, Any, Tuple
import whisper

def analyze_voice(audio_path: str) -> Dict[str, Any]:
    """
    Analyze voice characteristics from an audio file.
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        Dictionary with voice analysis metrics
    """
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=None)
        
        # Basic audio stats
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Transcribe audio
        transcription = transcribe_audio(audio_path)
        transcript = transcription["transcript"]
        
        # Calculate speech rate
        speech_rate_results = calculate_speech_rate(transcript, duration)
        
        # Analyze pitch variation
        pitch_results = analyze_pitch(audio_path)
        
        # Detect pauses
        pause_results = detect_pauses(y, sr)
        
        # Analyze voice stability
        stability_results = analyze_voice_stability(audio_path)
        
        # Analyze speech fluency
        fluency_results = analyze_speech_fluency(transcript)
        
        # Calculate overall metrics
        fluency_score = calculate_fluency_score(
            speech_rate_results["words_per_minute"],
            pause_results["pause_frequency"],
            fluency_results["filler_word_rate"]
        )
        
        pace_score = calculate_pace_score(
            speech_rate_results["words_per_minute"],
            pause_results["pause_frequency"]
        )
        
        voice_steadiness = calculate_voice_steadiness(
            pitch_results["pitch_variability"],
            stability_results["volume_stability"]
        )
        
        # Assess coherence
        speech_coherence = assess_speech_coherence(transcript)
        
        return {
            "transcript": transcript,
            "duration": duration,
            "words_per_minute": speech_rate_results["words_per_minute"],
            "syllables_per_minute": speech_rate_results["syllables_per_minute"],
            "pitch_mean": pitch_results["pitch_mean"],
            "pitch_variability": pitch_results["pitch_variability"],
            "pitch_variation": pitch_results["pitch_variation"],
            "pause_count": pause_results["pause_count"],
            "pause_frequency": pause_results["pause_frequency"],
            "avg_pause_duration": pause_results["avg_pause_duration"],
            "volume_stability": stability_results["volume_stability"],
            "filler_words": fluency_results["filler_words"],
            "filler_word_rate": fluency_results["filler_word_rate"],
            "fluency_score": round(fluency_score, 1),
            "pace_score": round(pace_score, 1),
            "voice_steadiness": round(voice_steadiness, 1),
            "speech_coherence": round(speech_coherence, 1),
            "pitch_confidence": round(pitch_results["pitch_confidence"], 1)
        }
    except Exception as e:
        # Return default values if analysis fails
        print(f"Voice analysis error: {str(e)}")
        return {
            "transcript": "Failed to analyze audio.",
            "duration": 0,
            "words_per_minute": 0,
            "syllables_per_minute": 0,
            "pitch_mean": 0,
            "pitch_variability": 0,
            "pitch_variation": 0,
            "pause_count": 0,
            "pause_frequency": 0,
            "avg_pause_duration": 0,
            "volume_stability": 0,
            "filler_words": [],
            "filler_word_rate": 0,
            "fluency_score": 5.0,
            "pace_score": 5.0,
            "voice_steadiness": 5.0,
            "speech_coherence": 5.0,
            "pitch_confidence": 5.0,
            "error": str(e)
        }

def transcribe_audio(audio_path: str, model_size: str = "base") -> Dict[str, Any]:
    """
    Transcribe audio to text using Whisper.
    
    Args:
        audio_path: Path to the audio file
        model_size: Whisper model size
        
    Returns:
        Dictionary with transcript and metadata
    """
    # Load Whisper model
    model = whisper.load_model(model_size)
    
    # Transcribe audio
    result = model.transcribe(audio_path)
    
    return {
        "transcript": result["text"],
        "segments": result["segments"],
        "language": result["language"]
    }

def calculate_speech_rate(transcript: str, duration: float) -> Dict[str, float]:
    """
    Calculate speech rate metrics.
    
    Args:
        transcript: Text transcript
        duration: Audio duration in seconds
        
    Returns:
        Dictionary with speech rate metrics
    """
    # Count words
    words = transcript.split()
    word_count = len(words)
    
    # Estimate syllables (simple approximation)
    syllable_count = 0
    for word in words:
        syllable_count += count_syllables(word)
    
    # Calculate rates per minute
    words_per_minute = (word_count / duration) * 60 if duration > 0 else 0
    syllables_per_minute = (syllable_count / duration) * 60 if duration > 0 else 0
    
    return {
        "word_count": word_count,
        "syllable_count": syllable_count,
        "words_per_minute": round(words_per_minute, 1),
        "syllables_per_minute": round(syllables_per_minute, 1)
    }

def count_syllables(word: str) -> int:
    """
    Count syllables in a word using a simple heuristic.
    
    Args:
        word: Word to count syllables for
        
    Returns:
        Number of syllables
    """
    word = word.lower()
    # Remove punctuation
    for char in ",.!?;:":
        word = word.replace(char, "")
    
    # Special cases
    if len(word) <= 3:
        return 1
    
    # Count vowel groups
    vowels = "aeiouy"
    count = 0
    prev_is_vowel = False
    
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel
    
    # Adjust for silent e
    if word.endswith('e') and not word.endswith('le'):
        count -= 1
    
    # Ensure at least one syllable
    return max(1, count)

def analyze_pitch(audio_path: str) -> Dict[str, float]:
    """
    Analyze pitch characteristics using Praat.
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        Dictionary with pitch metrics
    """
    try:
        # Load sound file
        sound = parselmouth.Sound(audio_path)
        
        # Extract pitch
        pitch = call(sound, "To Pitch", 0.0, 75, 600)
        
        # Get pitch values
        pitch_values = pitch.selected_array['frequency']
        
        # Filter out zero values (unvoiced frames)
        pitch_values = pitch_values[pitch_values > 0]
        
        if len(pitch_values) == 0:
            return {
                "pitch_mean": 0,
                "pitch_std": 0,
                "pitch_min": 0,
                "pitch_max": 0,
                "pitch_variability": 0,
                "pitch_variation": 0,
                "pitch_confidence": 0
            }
        
        # Calculate statistics
        pitch_mean = np.mean(pitch_values)
        pitch_std = np.std(pitch_values)
        pitch_min = np.min(pitch_values)
        pitch_max = np.max(pitch_values)
        
        # Calculate variability (coefficient of variation)
        pitch_variability = (pitch_std / pitch_mean) if pitch_mean > 0 else 0
        
        # Calculate pitch variation as range normalized by mean
        pitch_variation = ((pitch_max - pitch_min) / pitch_mean) if pitch_mean > 0 else 0
        
        # Calculate confidence based on number of voiced frames
        pitch_confidence = min(10, len(pitch_values) / 100)
        
        return {
            "pitch_mean": round(pitch_mean, 1),
            "pitch_std": round(pitch_std, 1),
            "pitch_min": round(pitch_min, 1),
            "pitch_max": round(pitch_max, 1),
            "pitch_variability": round(pitch_variability, 3),
            "pitch_variation": round(pitch_variation, 3),
            "pitch_confidence": pitch_confidence
        }
    except Exception as e:
        return {
            "pitch_mean": 0,
            "pitch_std": 0,
            "pitch_min": 0,
            "pitch_max": 0,
            "pitch_variability": 0,
            "pitch_variation": 0,
            "pitch_confidence": 0,
            "error": str(e)
        }

def detect_pauses(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """
    Detect pauses in speech.
    
    Args:
        y: Audio time series
        sr: Sampling rate
        
    Returns:
        Dictionary with pause metrics
    """
    # Calculate RMS energy
    frame_length = int(sr * 0.025)  # 25ms frames
    hop_length = int(sr * 0.010)    # 10ms hop
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    
    # Normalize RMS
    rms_norm = rms / np.max(rms) if np.max(rms) > 0 else rms
    
    # Define silence threshold
    silence_threshold = 0.1
    
    # Find silent frames
    silent_frames = rms_norm < silence_threshold
    
    # Group consecutive silent frames into pauses
    pauses = []
    is_pause = False
    pause_start = 0
    
    min_pause_duration = 0.3  # Minimum pause duration in seconds
    min_pause_frames = int(min_pause_duration * sr / hop_length)
    
    for i, silent in enumerate(silent_frames):
        if silent and not is_pause:
            # Start of a pause
            is_pause = True
            pause_start = i
        elif not silent and is_pause:
            # End of a pause
            pause_duration = (i - pause_start) * hop_length / sr
            if (i - pause_start) >= min_pause_frames:
                pauses.append(pause_duration)
            is_pause = False
    
    # Calculate pause metrics
    pause_count = len(pauses)
    avg_pause_duration = np.mean(pauses) if pauses else 0
    total_duration = len(y) / sr
    pause_frequency = pause_count / (total_duration / 60) if total_duration > 0 else 0
    
    return {
        "pause_count": pause_count,
        "pause_frequency": round(pause_frequency, 1),  # pauses per minute
        "avg_pause_duration": round(avg_pause_duration, 2),
        "pauses": pauses
    }

def analyze_voice_stability(audio_path: str) -> Dict[str, float]:
    """
    Analyze voice stability using volume variation.
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        Dictionary with stability metrics
    """
    try:
        # Load sound file
        sound = parselmouth.Sound(audio_path)
        
        # Get intensity (volume)
        intensity = call(sound, "To Intensity", 100, 0.0, "yes")
        intensity_values = call(intensity, "Get all values", 0, 0, 0, 0)
        
        # Calculate stability metrics
        if len(intensity_values) > 0:
            intensity_mean = np.mean(intensity_values)
            intensity_std = np.std(intensity_values)
            
            # Coefficient of variation as stability measure
            volume_variation = intensity_std / intensity_mean if intensity_mean > 0 else 0
            
            # Convert to stability score (lower variation = higher stability)
            volume_stability = max(0, 10 - (volume_variation * 20))
            
            return {
                "intensity_mean": round(intensity_mean, 1),
                "intensity_std": round(intensity_std, 1),
                "volume_variation": round(volume_variation, 3),
                "volume_stability": round(volume_stability, 1)
            }
        else:
            return {
                "intensity_mean": 0,
                "intensity_std": 0,
                "volume_variation": 0,
                "volume_stability": 5.0
            }
    except Exception as e:
        return {
            "intensity_mean": 0,
            "intensity_std": 0,
            "volume_variation": 0,
            "volume_stability": 5.0,
            "error": str(e)
        }

def analyze_speech_fluency(transcript: str) -> Dict[str, Any]:
    """
    Analyze speech fluency by detecting filler words.
    
    Args:
        transcript: Text transcript
        
    Returns:
        Dictionary with fluency metrics
    """
    # List of common filler words and sounds
    filler_words = [
        "um", "uh", "er", "ah", "like", "you know", "so", "actually", 
        "basically", "literally", "kind of", "sort of", "i mean"
    ]
    
    # Convert transcript to lowercase for easier matching
    lower_transcript = transcript.lower()
    
    # Count filler words
    filler_word_count = 0
    found_fillers = []
    
    for filler in filler_words:
        # Count occurrences
        count = lower_transcript.count(f" {filler} ")
        if count > 0:
            filler_word_count += count
            found_fillers.append({"word": filler, "count": count})
    
    # Calculate filler word rate
    word_count = len(transcript.split())
    filler_rate = filler_word_count / word_count if word_count > 0 else 0
    
    return {
        "filler_words": found_fillers,
        "filler_word_count": filler_word_count,
        "filler_word_rate": round(filler_rate, 3)
    }

def calculate_fluency_score(
    words_per_minute: float,
    pause_frequency: float,
    filler_word_rate: float
) -> float:
    """
    Calculate overall fluency score.
    
    Args:
        words_per_minute: Speaking rate
        pause_frequency: Number of pauses per minute
        filler_word_rate: Rate of filler words
        
    Returns:
        Fluency score (0-10)
    """
    # Optimal ranges
    optimal_wpm_min = 120
    optimal_wpm_max = 160
    optimal_pause_freq = 4  # ~4 pauses per minute is natural
    
    # Calculate wpm score
    if words_per_minute < optimal_wpm_min:
        # Too slow
        wpm_score = 7 * (words_per_minute / optimal_wpm_min)
    elif words_per_minute > optimal_wpm_max:
        # Too fast
        wpm_score = 7 * (2 - (words_per_minute / optimal_wpm_max))
    else:
        # Optimal range
        wpm_score = 7
    
    # Calculate pause score
    pause_diff = abs(pause_frequency - optimal_pause_freq)
    pause_score = max(0, 3 - (pause_diff * 0.3))
    
    # Calculate filler word penalty
    filler_penalty = min(5, filler_word_rate * 50)
    
    # Final fluency score
    fluency_score = wpm_score + pause_score - filler_penalty
    fluency_score = max(0, min(10, fluency_score))
    
    return fluency_score

def calculate_pace_score(words_per_minute: float, pause_frequency: float) -> float:
    """
    Calculate pace score.
    
    Args:
        words_per_minute: Speaking rate
        pause_frequency: Number of pauses per minute
        
    Returns:
        Pace score (0-10)
    """
    # Optimal ranges
    optimal_wpm_min = 120
    optimal_wpm_max = 160
    optimal_pause_min = 3
    optimal_pause_max = 5
    
    # Calculate wpm component
    if words_per_minute < optimal_wpm_min:
        # Too slow
        wpm_component = 6 * (words_per_minute / optimal_wpm_min)
    elif words_per_minute > optimal_wpm_max:
        # Too fast
        wpm_component = 6 * (2 - (words_per_minute / optimal_wpm_max))
    else:
        # Optimal range
        wpm_component = 6
    
    # Calculate pause component
    if pause_frequency < optimal_pause_min:
        # Too few pauses
        pause_component = 4 * (pause_frequency / optimal_pause_min)
    elif pause_frequency > optimal_pause_max:
        # Too many pauses
        pause_component = 4 * (2 - (pause_frequency / optimal_pause_max))
    else:
        # Optimal range
        pause_component = 4
    
    # Final pace score
    pace_score = wpm_component + pause_component
    pace_score = max(0, min(10, pace_score))
    
    return pace_score

def calculate_voice_steadiness(pitch_variability: float, volume_stability: float) -> float:
    """
    Calculate voice steadiness score based on pitch and volume stability.
    
    Args:
        pitch_variability: Variation in pitch
        volume_stability: Stability of volume
        
    Returns:
        Voice steadiness score (0-10)
    """
    # Calculate pitch component
    # Lower pitch variability (< 0.2) indicates steadier voice
    if pitch_variability < 0.05:
        # Too monotone
        pitch_component = 3
    elif pitch_variability > 0.3:
        # Too variable
        pitch_component = 5 * (1 - min(1, (pitch_variability - 0.3) / 0.3))
    else:
        # Optimal range
        pitch_component = 5
    
    # Volume stability is already on a 0-10 scale
    volume_component = volume_stability / 2  # Scale to 0-5
    
    # Final steadiness score
    steadiness_score = pitch_component + volume_component
    steadiness_score = max(0, min(10, steadiness_score))
    
    return steadiness_score

def assess_speech_coherence(transcript: str) -> float:
    """
    Assess speech coherence based on sentence structure and flow.
    
    Args:
        transcript: Text transcript
        
    Returns:
        Coherence score (0-10)
    """
    # Basic coherence assessment using sentence length variation
    sentences = []
    for end_mark in ['.', '!', '?']:
        parts = transcript.split(end_mark)
        for part in parts[:-1]:  # Skip the last part which might be empty
            if part.strip():
                sentences.append(part.strip())
    
    # If no clear sentences, split by commas as fallback
    if len(sentences) <= 1:
        parts = transcript.split(',')
        sentences = [part.strip() for part in parts if part.strip()]
    
    # If still no sentences, return default score
    if len(sentences) <= 1:
        return 5.0
    
    # Calculate sentence length statistics
    sentence_lengths = [len(s.split()) for s in sentences]
    avg_length = sum(sentence_lengths) / len(sentence_lengths)
    
    # Penalize very short or very long average sentence length
    if avg_length < 5:
        length_score = 3 + (avg_length / 5) * 2  # Penalize too short
    elif avg_length > 25:
        length_score = 7 - min(4, (avg_length - 25) / 10)  # Penalize too long
    else:
        length_score = 7  # Optimal range
    
    # Calculate sentence length variation
    if len(sentence_lengths) > 1:
        length_std = np.std(sentence_lengths)
        
        # Too much variation or too little variation is penalized
        if length_std < 1:
            variation_score = 1  # Too monotonous
        elif length_std > 15:
            variation_score = 1  # Too erratic
        else:
            # Optimal variation is around 3-8 words
            variation_score = 3 - min(2, abs(length_std - 5) / 3)
    else:
        variation_score = 1.5
    
    # Calculate coherence score
    coherence_score = length_score + variation_score
    coherence_score = max(0, min(10, coherence_score))
    
    return coherence_score