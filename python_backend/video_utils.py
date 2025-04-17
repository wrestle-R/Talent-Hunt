import os
import subprocess
from typing import Optional
import moviepy.editor as mp
import whisper

def extract_audio(video_path: str, output_dir: str) -> str:
    """
    Extract audio from video file.
    
    Args:
        video_path: Path to the video file
        output_dir: Directory to save the extracted audio
        
    Returns:
        Path to the extracted audio file
    """
    audio_path = os.path.join(output_dir, "extracted_audio.wav")
    
    # Using moviepy
    video = mp.VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path, codec='pcm_s16le', fps=16000)
    
    return audio_path

def transcribe_audio(audio_path: str, model_size: str = "base") -> dict:
    """
    Transcribe audio file to text using OpenAI's Whisper.
    
    Args:
        audio_path: Path to the audio file
        model_size: Whisper model size ("tiny", "base", "small", "medium", "large")
        
    Returns:
        Dictionary containing transcript and metadata
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

def extract_video_frames(video_path: str, output_dir: str, fps: int = 1) -> str:
    """
    Extract frames from video at specified rate.
    
    Args:
        video_path: Path to the video file
        output_dir: Directory to save the extracted frames
        fps: Frames per second to extract
        
    Returns:
        Path to the directory containing extracted frames
    """
    frames_dir = os.path.join(output_dir, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    
    # Using ffmpeg to extract frames
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps={fps}",
        os.path.join(frames_dir, "frame_%04d.jpg")
    ]
    
    subprocess.run(cmd, check=True)
    
    return frames_dir

def get_video_duration(video_path: str) -> float:
    """
    Get the duration of a video file in seconds.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        Duration in seconds
    """
    video = mp.VideoFileClip(video_path)
    duration = video.duration
    video.close()
    
    return duration

def get_video_metadata(video_path: str) -> dict:
    """
    Get metadata for a video file.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        Dictionary containing video metadata
    """
    video = mp.VideoFileClip(video_path)
    
    metadata = {
        "duration": video.duration,
        "fps": video.fps,
        "size": video.size,
        "rotation": video.rotation
    }
    
    video.close()
    
    return metadata