from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
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