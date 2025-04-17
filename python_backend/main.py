from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import tempfile
import shutil
import uuid
from datetime import date
from fastapi import Body
import os
from fastapi.middleware.cors import CORSMiddleware
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.output_parser import StrOutputParser
import traceback
from video_utils import extract_audio
from nlp_analysis import analyze_transcript
from emotion_detection import analyze_facial_expressions
from voice_analysis import analyze_voice


load_dotenv()

app = FastAPI(title="Python Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
def startup_event():
    app.state.embedding_model = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    print("Model cached in FastAPI state!")


# Request Model for File Path
class FilePathRequest(BaseModel):
    file_path: str

@app.post('/api/add_student')
def add_student(request: FilePathRequest):
    try:
        file_path = request.file_path
        current_dir = os.path.dirname(__file__)
        persistance_path = os.path.join(current_dir, 'db', 'students_data')

        loader = JSONLoader(file_path=file_path, jq_schema='.[]', text_content=False)
        data = loader.load()

        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        docs = text_splitter.split_documents(data)

        if not os.path.exists(persistance_path):
            os.makedirs(persistance_path)  # Ensure directory exists
            db = Chroma.from_documents(docs,app.state.embedding_model, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=app.state.embedding_model)
            db.add_documents(docs)

        return {"message": "Student added successfully", "total_documents": len(db.get())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/add_mentor')
def add_mentor(request: FilePathRequest):
    try:
        file_path = request.file_path
        current_dir = os.path.dirname(__file__)
        persistance_path = os.path.join(current_dir, 'db', 'mentors_data')

        loader = JSONLoader(file_path=file_path, jq_schema='.[]', text_content=False)
        data = loader.load()

        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        docs = text_splitter.split_documents(data)

        if not os.path.exists(persistance_path):
            os.makedirs(persistance_path)  # Ensure directory exists
            db = Chroma.from_documents(docs, app.state.embedding_model, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=app.state.embedding_model)
            db.add_documents(docs)

        return {"message": "Mentor added successfully", "total_documents": len(db.get())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend_students")
def recommend_student(request_data: dict = Body(...)):
    try:
        # Extract userData from the request
        userData = request_data.get('userData', {})
        
        model = ChatGoogleGenerativeAI(model='gemini-1.5-flash')

        print("USER INPUT: ", userData)

        prompt = ChatPromptTemplate.from_messages([
            ('system', """Your prompt text here"""),
            ("human", "{user_input}")
        ])

        chain = prompt | model | StrOutputParser()
        query = chain.invoke({"user_input": userData})
        print("Generated Query for RAG: ", query)

        current_dir = os.path.dirname(__file__)
        persistance_dir = os.path.join(current_dir, 'db', 'students_data')

        # Safely get team size with defaults
        team_size = 4  # Default value
        
        # Check if teammate_search exists and has purpose
        if 'teammate_search' in userData:
            teammate_search = userData['teammate_search']
            purpose = teammate_search.get('purpose', 'Hackathon')
            
            if purpose in ["Project", "Both"] and 'project_preferences' in teammate_search:
                team_size = int(teammate_search['project_preferences'].get('team_size', team_size))
            elif purpose in ["Hackathon", "Both"] and 'hackathon_preferences' in teammate_search:
                team_size = int(teammate_search['hackathon_preferences'].get('team_size', team_size))

        db = Chroma(persist_directory=persistance_dir, embedding_function=app.state.embedding_model)
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": team_size})
        relevant_docs = retriever.invoke(query)

        relevant_docs_content = [doc.page_content for doc in relevant_docs]

        return {"teammates": relevant_docs_content}
    except Exception as e:
        print(f"Error: {type(e)} - {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend_mentors")
def recommend_mentor(user_input: dict = Body(...)):
    try:
        model = ChatGoogleGenerativeAI(model='gemini-1.5-latest')

        user_input = str(user_input)

        prompt = ChatPromptTemplate.from_messages([  
                ("system",  
                "Generate an optimized RAG query to identify the most suitable mentors for a competition based on the user's profile. "  
                "Focus on aligning skills, experience, hackathon participation, and project background. "  
                "Output only the RAG query without additional details."),  
                ("human", "{user_input}")  
            ])

        chain = model | prompt | StrOutputParser()
        query = chain.invoke({"user_input": user_input})

        current_dir = os.path.dirname(__file__)
        persistance_dir = os.path.join(current_dir, 'db', 'mentors_data')

        db = Chroma(persist_directory=persistance_dir, embedding_function=app.state.embedding_model)
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 5})
        relevant_docs = retriever.invoke(query)

        relevant_docs_content = [doc.page_content for doc in relevant_docs]

        return {"mentors": relevant_docs_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/analyze_video")
async def analyze_presentations(video: UploadFile = File(...)) -> Dict[str, Any]:
    if not video.filename.lower().endswith(('.mp4', '.mov', '.avi')):
        raise HTTPException(status_code=400, detail="Invalid video format. Only .mp4, .mov, and .avi are supported.")
    temp_dir = tempfile.mkdtemp()
    try:
        # Save uploaded video
        temp_video_path = os.path.join(temp_dir, f"{uuid.uuid4()}{os.path.splitext(video.filename)[1]}")
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # Extract audio
        audio_path = extract_audio(temp_video_path, temp_dir)
        
        # Process the video and audio in parallel (in a real implementation)
        # For now, we'll do it sequentially
        
        # 1. Analyze audio for transcription & voice qualities
        voice_results = analyze_voice(audio_path)
        
        # 2. Analyze facial expressions
        emotion_results = analyze_facial_expressions(temp_video_path)
        
        # 3. Analyze transcript for NLP assessment
        nlp_results = analyze_transcript(voice_results["transcript"])
        
        # 4. Calculate final scores
        final_scores = calculate_final_scores(nlp_results, emotion_results, voice_results)
        
        # 5. Generate recommendations
        recommendations = generate_recommendations(final_scores, nlp_results, emotion_results, voice_results)
        
        # Compile results
        analysis_results = {
            "scores": final_scores,
            "recommendations": recommendations,
            "details": {
                "nlp_analysis": nlp_results,
                "emotion_analysis": emotion_results,
                "voice_analysis": voice_results
            }
        }
        
        return analysis_results

    finally:
        # Clean up temporary files
        shutil.rmtree(temp_dir)

def calculate_final_scores(nlp_results, emotion_results, voice_results):
    """Calculate final scores based on all analyses."""
    return {
        "content_clarity": round((
            nlp_results["clarity_score"] * 0.7 + 
            voice_results["speech_coherence"] * 0.3
        ), 1),
        "technical_vocabulary": round(nlp_results["tech_term_score"], 1),
        "delivery": round((
            voice_results["fluency_score"] * 0.6 + 
            voice_results["pace_score"] * 0.4
        ), 1),
        "confidence": round((
            emotion_results["confidence_score"] * 0.5 + 
            voice_results["voice_steadiness"] * 0.5
        ), 1),
        "engagement": round((
            emotion_results["engagement_score"] * 0.7 + 
            voice_results["pitch_variation"] * 0.3
        ), 1),
        "overall": round((
            nlp_results["clarity_score"] * 0.25 +
            nlp_results["tech_term_score"] * 0.15 +
            voice_results["fluency_score"] * 0.2 +
            emotion_results["confidence_score"] * 0.2 +
            emotion_results["engagement_score"] * 0.2
        ), 1)
    }

def generate_recommendations(scores, nlp_results, emotion_results, voice_results):
    """Generate personalized recommendations based on lowest scores."""
    recommendations = []
    
    # Check content clarity
    if scores["content_clarity"] < 7.0:
        if nlp_results["clarity_score"] < 7.0:
            recommendations.append(
                "Consider simplifying your explanations and using more concrete examples to illustrate technical concepts."
            )
        if voice_results["speech_coherence"] < 7.0:
            recommendations.append(
                "Try to organize your thoughts more clearly before speaking. Using transition phrases can help connect ideas."
            )
    
    # Check technical vocabulary
    if scores["technical_vocabulary"] < 7.0:
        recommendations.append(
            f"Your use of technical terms could be improved. Consider incorporating more domain-specific vocabulary appropriate for {nlp_results['detected_domain']}."
        )
    
    # Check delivery
    if scores["delivery"] < 7.0:
        if voice_results["fluency_score"] < 7.0:
            recommendations.append(
                "Practice speaking more fluently by reducing filler words like 'um' and 'uh'. Try recording yourself and identifying areas for improvement."
            )
        if voice_results["pace_score"] < 7.0:
            recommendations.append(
                f"Your speaking pace of {voice_results['words_per_minute']} words per minute could be improved. Aim for a comfortable 120-150 words per minute."
            )
    
    # Check confidence
    if scores["confidence"] < 7.0:
        if emotion_results["confidence_score"] < 7.0:
            recommendations.append(
                "Try to maintain more consistent eye contact with the camera and improve your posture to project confidence."
            )
        if voice_results["voice_steadiness"] < 7.0:
            recommendations.append(
                "Your voice shows signs of nervousness. Practice breathing techniques to maintain a steadier tone."
            )
    
    # Check engagement
    if scores["engagement"] < 7.0:
        if emotion_results["engagement_score"] < 7.0:
            recommendations.append(
                "Consider incorporating more facial expressions and gestures to appear more engaged with your content."
            )
        if voice_results["pitch_variation"] < 7.0:
            recommendations.append(
                "Your voice tone is somewhat monotonous. Try varying your pitch and emphasis to make key points stand out."
            )
    
    # If doing well overall
    if not recommendations and scores["overall"] >= 8.0:
        recommendations.append(
            "Great job! Your presentation skills are strong. To further improve, consider focusing on advanced techniques like storytelling and audience interaction."
        )
    
    return recommendations
