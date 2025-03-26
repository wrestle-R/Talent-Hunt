from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from fastapi import Body
import os
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from langchain.schema.output_parser import StrOutputParser

load_dotenv()

app = FastAPI(title="Python Backend")

# Global variable to store the embeddings model
global_embeddings = None

@app.on_event("startup")
def startup_event():
    global global_embeddings
    # Load the embedding model when the server starts
    global_embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    print("Embedding model loaded successfully!")

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
            db = Chroma.from_documents(docs, global_embeddings, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=global_embeddings)
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
            db = Chroma.from_documents(docs, global_embeddings, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=global_embeddings)
            db.add_documents(docs)

        return {"message": "Mentor added successfully", "total_documents": len(db.get())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend_students")
def recommend_student(user_input: dict = Body(...)):
    try:
        model = ChatMistralAI(model='mistral-small-latest')

        # Convert dict to JSON string
        user_input_str = str(user_input)  # Or use json.dumps(user_input)

        prompt = ChatPromptTemplate.from_messages([
            ('system', """Analyze the user's profile data, including skills, experience, past hackathons, and project background.  
                Generate a structured RAG query to retrieve the most relevant teammates for a hackathon.  

                The query should prioritize candidates based on:  
                1. **Skill Complementarity**: Find students with at least 70 percent skill overlap or complementary expertise.  
                2. **Relevant Experience**: Prioritize those with prior experience in similar hackathons, projects, or internships.  
                3. **Hackathon Alignment**: Match students who have participated in or are interested in similar hackathons.  
                4. **Project Compatibility**: Consider shared technologies, domains, and problem-solving approaches.  
                5. **Collaboration Potential**: Prefer candidates with a history of teamwork and successful collaborations.  

                Ensure the query is structured for an optimized similarity-based search. **Return only the RAG query and nothing else.**  """),
            ("human", "{user_input}")
        ])

        # Pass the string as a dictionary with the key matching the template variable
        chain = prompt | model | StrOutputParser()
        query = chain.invoke({"user_input": user_input_str})
        print("Generated Query for RAG: ",query)

        current_dir = os.path.dirname(__file__)
        persistance_dir = os.path.join(current_dir, 'db', 'students_data')

        db = Chroma(persist_directory=persistance_dir, embedding_function=global_embeddings)
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 5})
        relevant_docs = retriever.invoke(query)

        processed_docs = [doc.page_content.replace("{", "{{").replace("}", "}}") for doc in relevant_docs]
        relevant_docs_content = "\n\n".join(processed_docs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", 
            "You are an intelligent assistant that helps match students with ideal teammates based on their skills, interests, past experiences, and project compatibility. "
            "Use the provided student profiles to analyze their strengths and suggest the most suitable candidates for collaboration."
            ),
            ("system", "Below are the most relevant student profiles extracted from the database:"),
            ("system", relevant_docs_content),
            ("system", 
            "Carefully evaluate the user's query and compare it with the student profiles. "
            "Prioritize recommendations based on skill alignment, previous experience, and shared interests. "
            "If no exact match is found, suggest the closest possible candidates based on their adaptability and related expertise."
            ),
            ("human", "{query}")
        ])

        chain = prompt | model | StrOutputParser()
        response = chain.invoke({"query": query})

        return {"recommendations": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend_mentors")
def recommend_mentor(user_input: dict = Body(...)):
    try:
        model = ChatMistralAI(model='mistral-small-latest')

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

        db = Chroma(persist_directory=persistance_dir, embedding_function=global_embeddings)
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 5})
        relevant_docs = retriever.invoke(query)

        processed_docs = [doc.page_content.replace("{", "{{").replace("}", "}}") for doc in relevant_docs]
        relevant_docs_content = "\n\n".join(processed_docs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant that suggests mentors based on their skills and interests."),
            ("system", "Here are some relevant mentor profiles:"),
            ("system", relevant_docs_content),
            ("human", "{query}")
        ])

        chain = prompt | model | StrOutputParser()
        response = chain.invoke({"query": query})

        return {"recommendations": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))