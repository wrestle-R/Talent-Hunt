import os
import cv2
import numpy as np
from typing import Dict, List, Any, Tuple
import mediapipe as mp
from deepface import DeepFace
import time

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

def analyze_facial_expressions(video_path: str) -> Dict[str, Any]:
    """
    Analyze facial expressions from a video.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        Dictionary with facial expression metrics
    """
    # Extract frames from video at 1 fps
    frames = extract_frames(video_path, fps=1)
    
    if not frames:
        return {
            "face_detected": False,
            "confidence_score": 5.0,  # Neutral default
            "engagement_score": 5.0,  # Neutral default
            "emotion_distribution": {"neutral": 1.0},
            "eye_contact_percentage": 0.0,
            "smile_percentage": 0.0,
            "attention_score": 5.0,
            "frame_count": 0,
            "error": "No frames extracted from video"
        }
    
    # Analyze each frame
    emotions_results = []
    face_detected_frames = 0
    smile_frames = 0
    eye_contact_frames = 0
    
    # Use mediapipe for eye contact analysis
    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as face_mesh:
        
        for frame in frames:
            result = analyze_frame(frame, face_mesh)
            
            if result["face_detected"]:
                face_detected_frames += 1
                emotions_results.append(result["emotions"])
                
                if result["is_smiling"]:
                    smile_frames += 1
                    
                if result["eye_contact"]:
                    eye_contact_frames += 1
    
    # If no faces detected in any frame
    if face_detected_frames == 0:
        return {
            "face_detected": False,
            "confidence_score": 5.0,
            "engagement_score": 5.0,
            "emotion_distribution": {"neutral": 1.0},
            "eye_contact_percentage": 0.0,
            "smile_percentage": 0.0,
            "attention_score": 5.0,
            "frame_count": len(frames),
            "error": "No faces detected in video frames"
        }
    
    # Calculate percentages
    face_percentage = face_detected_frames / len(frames)
    smile_percentage = smile_frames / max(1, face_detected_frames)
    eye_contact_percentage = eye_contact_frames / max(1, face_detected_frames)
    
    # Aggregate emotion results
    aggregated_emotions = aggregate_emotions(emotions_results)
    
    # Calculate confidence and engagement scores
    confidence_score = calculate_confidence_score(
        aggregated_emotions,
        smile_percentage,
        eye_contact_percentage
    )
    
    engagement_score = calculate_engagement_score(
        aggregated_emotions,
        smile_percentage,
        eye_contact_percentage,
        face_percentage
    )
    
    # Calculate attention score
    attention_score = (eye_contact_percentage * 10 + face_percentage * 10) / 2
    
    return {
        "face_detected": True,
        "confidence_score": round(confidence_score, 1),
        "engagement_score": round(engagement_score, 1),
        "emotion_distribution": {k: round(v, 2) for k, v in aggregated_emotions.items()},
        "eye_contact_percentage": round(eye_contact_percentage * 100, 1),
        "smile_percentage": round(smile_percentage * 100, 1),
        "attention_score": round(attention_score, 1),
        "frame_count": len(frames),
        "faces_detected_count": face_detected_frames
    }

def extract_frames(video_path: str, fps: int = 1) -> List[np.ndarray]:
    """
    Extract frames from a video at specified fps.
    
    Args:
        video_path: Path to the video file
        fps: Frames per second to extract
        
    Returns:
        List of frames as numpy arrays
    """
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return frames
    
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(video_fps / fps)
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Extract frames at specified interval
        if frame_count % frame_interval == 0:
            frames.append(frame)
        
        frame_count += 1
        
        # Limit to 100 frames max to avoid memory issues
        if len(frames) >= 100:
            break
    
    cap.release()
    return frames

def analyze_frame(frame: np.ndarray, face_mesh) -> Dict[str, Any]:
    """
    Analyze a single frame for facial expressions.
    
    Args:
        frame: Video frame as numpy array
        face_mesh: MediaPipe face mesh model
        
    Returns:
        Dictionary with frame analysis results
    """
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process frame with MediaPipe
    results = face_mesh.process(rgb_frame)
    
    result = {
        "face_detected": False,
        "emotions": {"neutral": 1.0},
        "is_smiling": False,
        "eye_contact": False
    }
    
    # If no face detected
    if not results.multi_face_landmarks:
        return result
    
    # Face detected
    result["face_detected"] = True
    
    # Extract face landmarks
    face_landmarks = results.multi_face_landmarks[0]
    
    # Analyze eye contact
    result["eye_contact"] = check_eye_contact(face_landmarks)
    
    # Analyze smile
    result["is_smiling"] = detect_smile(face_landmarks)
    
    try:
        # Analyze emotions with DeepFace
        emotion_result = DeepFace.analyze(
            img_path=frame,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )
        
        if isinstance(emotion_result, list):
            emotion_result = emotion_result[0]
            
        result["emotions"] = emotion_result["emotion"]
        # Convert to probability distribution
        total = sum(result["emotions"].values())
        result["emotions"] = {k: v/total for k, v in result["emotions"].items()}
        
    except Exception as e:
        # If DeepFace fails, use neutral emotion
        result["emotions"] = {"neutral": 0.7, "happiness": 0.3}
    
    return result

def check_eye_contact(face_landmarks) -> bool:
    """
    Check if the person is looking at the camera.
    
    Args:
        face_landmarks: MediaPipe face landmarks
        
    Returns:
        Boolean indicating eye contact
    """
    # Extract eye landmarks
    left_eye = [(face_landmarks.landmark[33].x, face_landmarks.landmark[33].y),
                (face_landmarks.landmark[133].x, face_landmarks.landmark[133].y)]
    right_eye = [(face_landmarks.landmark[362].x, face_landmarks.landmark[362].y),
                 (face_landmarks.landmark[263].x, face_landmarks.landmark[263].y)]
    
    # Calculate eye direction
    left_eye_dir = left_eye[1][0] - left_eye[0][0]
    right_eye_dir = right_eye[1][0] - right_eye[0][0]
    
    # Check if eyes are looking forward
    # Simplified heuristic: if both eyes have similar horizontal direction
    eye_direction_diff = abs(left_eye_dir - right_eye_dir)
    
    return eye_direction_diff < 0.05

def detect_smile(face_landmarks) -> bool:
    """
    Detect if the person is smiling.
    
    Args:
        face_landmarks: MediaPipe face landmarks
        
    Returns:
        Boolean indicating smile detection
    """
    # Extract mouth landmarks
    mouth_top = face_landmarks.landmark[13]
    mouth_bottom = face_landmarks.landmark[14]
    mouth_left = face_landmarks.landmark[78]
    mouth_right = face_landmarks.landmark[308]
    
    # Calculate mouth aspect ratio
    mouth_width = np.sqrt((mouth_right.x - mouth_left.x)**2 + (mouth_right.y - mouth_left.y)**2)
    mouth_height = np.sqrt((mouth_top.x - mouth_bottom.x)**2 + (mouth_top.y - mouth_bottom.y)**2)
    
    mouth_ratio = mouth_height / mouth_width if mouth_width > 0 else 0
    
    # Check for smile
    return mouth_ratio < 0.3  # Lower values indicate wider mouth, suggesting smile

def aggregate_emotions(emotions_list: List[Dict[str, float]]) -> Dict[str, float]:
    """
    Aggregate emotions across frames.
    
    Args:
        emotions_list: List of emotion distributions
        
    Returns:
        Aggregated emotion distribution
    """
    if not emotions_list:
        return {"neutral": 1.0}
    
    # Initialize aggregated emotions
    aggregated = {}
    
    # Sum emotions across frames
    for emotions in emotions_list:
        for emotion, value in emotions.items():
            if emotion in aggregated:
                aggregated[emotion] += value
            else:
                aggregated[emotion] = value
    
    # Normalize
    total = sum(aggregated.values())
    aggregated = {k: v/total for k, v in aggregated.items()}
    
    return aggregated

def calculate_confidence_score(
    emotions: Dict[str, float],
    smile_percentage: float,
    eye_contact_percentage: float
) -> float:
    """
    Calculate confidence score based on facial expressions.
    
    Args:
        emotions: Distribution of emotions
        smile_percentage: Percentage of frames with smiles
        eye_contact_percentage: Percentage of frames with eye contact
        
    Returns:
        Confidence score (0-10)
    """
    # Negative emotions decrease confidence score
    negative_emotion_score = (
        emotions.get("fear", 0) + 
        emotions.get("sad", 0) + 
        emotions.get("angry", 0) + 
        emotions.get("disgust", 0)
    )
    
    # Positive emotions increase confidence score
    positive_emotion_score = (
        emotions.get("happy", 0) + 
        emotions.get("surprise", 0) * 0.5
    )
    
    # Calculate base confidence score
    base_score = 5.0 + (positive_emotion_score * 3) - (negative_emotion_score * 3)
    
    # Adjust based on smile and eye contact
    smile_factor = smile_percentage * 2  # 0-2 points
    eye_contact_factor = eye_contact_percentage * 3  # 0-3 points
    
    # Final score
    confidence_score = base_score + smile_factor + eye_contact_factor
    confidence_score = max(0, min(10, confidence_score))
    
    return confidence_score

def calculate_engagement_score(
    emotions: Dict[str, float],
    smile_percentage: float,
    eye_contact_percentage: float,
    face_percentage: float
) -> float:
    """
    Calculate engagement score based on facial expressions.
    
    Args:
        emotions: Distribution of emotions
        smile_percentage: Percentage of frames with smiles
        eye_contact_percentage: Percentage of frames with eye contact
        face_percentage: Percentage of frames with face detected
        
    Returns:
        Engagement score (0-10)
    """
    # Calculate emotional engagement
    emotional_engagement = (
        emotions.get("happy", 0) * 1.0 +
        emotions.get("surprise", 0) * 0.8 +
        emotions.get("neutral", 0) * 0.5 +
        emotions.get("angry", 0) * 0.3 +  # Even negative emotions show engagement
        emotions.get("sad", 0) * 0.3 +
        emotions.get("fear", 0) * 0.3 +
        emotions.get("disgust", 0) * 0.3
    ) * 5
    
    # Eye contact is crucial for engagement
    eye_contact_factor = eye_contact_percentage * 4
    
    # Smile indicates engagement
    smile_factor = smile_percentage * 2
    
    # Face presence is a baseline requirement
    face_factor = face_percentage * 2
    
    # Calculate final score
    engagement_score = emotional_engagement + eye_contact_factor + smile_factor + face_factor
    engagement_score = max(0, min(10, engagement_score))
    
    return engagement_score