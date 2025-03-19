from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        if not os.path.exists(persistance_path):
            os.makedirs(persistance_path)  # Ensure directory exists
            db = Chroma.from_documents(docs, embeddings, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=embeddings)
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
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        if not os.path.exists(persistance_path):
            os.makedirs(persistance_path)  # Ensure directory exists
            db = Chroma.from_documents(docs, embeddings, persist_directory=persistance_path)
        else:
            db = Chroma(persist_directory=persistance_path, embedding_function=embeddings)
            db.add_documents(docs)

        return {"message": "Mentor added successfully", "total_documents": len(db.get())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommend_students")
def recommend_student(user_input: dict):
    try:
        model = ChatMistralAI(model='mistral-small-latest')

        prompt = ChatPromptTemplate.from_messages([
            ('system', "Based on the data passed to you, create a RAG query to recommend teammates to that would help the user for the particular competition. Only return the RAG query and nothing else."),
            ("human", "{user_input}")
        ])

        chain = model | prompt | StrOutputParser()
        query = chain.invoke({"user_input": user_input})

        current_dir = os.path.dirname(__file__)
        persistance_dir = os.path.join(current_dir, 'db', 'students_data')
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        db = Chroma(persist_directory=persistance_dir, embedding_function=embeddings)
        retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 5})
        relevant_docs = retriever.invoke(query)


        processed_docs = [doc.page_content.replace("{", "{{").replace("}", "}}") for doc in relevant_docs]
        relevant_docs_content = "\n\n".join(processed_docs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant that suggests students based on their skills and interests."),
            ("system", "Here are some relevant student profiles:"),
            ("system", relevant_docs_content),
            ("human", "{query}")
        ])

        chain = prompt | model | StrOutputParser()
        response = chain.invoke({"query": query})

        return {"recommendations": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommend_mentors")
def recommend_mentor(user_input: dict):
    try:
        
        model = ChatMistralAI(model='mistral-small-latest')

        prompt = ChatPromptTemplate.from_messages([
            ('system', "Based on the data passed to you, create a RAG query to recommend teammates to that would help the user for the particular competition. Only return the RAG query and nothing else."),
            ("human", "{user_input}")
        ])

        chain = model | prompt | StrOutputParser()
        query = chain.invoke({"user_input": user_input})

        current_dir = os.path.dirname(__file__)
        persistance_dir = os.path.join(current_dir, 'db', 'mentors_data')
        embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        db = Chroma(persist_directory=persistance_dir, embedding_function=embeddings)
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
