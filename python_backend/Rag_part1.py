# import os
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_chroma import Chroma
# from langchain_community.document_loaders import JSONLoader
# from langchain_huggingface.embeddings import HuggingFaceEmbeddings

# current_dir = os.path.dirname(__file__)
# file_path = os.path.join(current_dir, 'mentors.json')  # Updated filename
# persistence_path = os.path.join(current_dir, 'db', 'mentors_data')  # Updated path

# if not os.path.exists(persistence_path):
#     print("Persistence path does not exist. Creating one now...")
    
#     # Create directory if it doesn't exist
#     os.makedirs(os.path.dirname(persistence_path), exist_ok=True)
    
#     # Using jq_schema='.[]' to process each array element separately
#     loader = JSONLoader(file_path, jq_schema='.[]', text_content=False)
#     data = loader.load()
    
#     # Using RecursiveCharacterTextSplitter for better handling of JSON structures
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=2000,  # Larger chunk size to keep student records together
#         chunk_overlap=200
#     )
#     docs = text_splitter.split_documents(data)
    
#     # Displaying information about the chunks
#     print('\n----- Document Chunks Information -----')
#     print(f'Number of documents: {len(docs)}')
#     print(f'Sample Chunk: \n{docs[0].page_content}\n')
    
#     # Create Embeddings using HuggingFace's wrapper for sentence-transformers
#     print('Creating Sentence Transformers Embeddings...')
#     embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
#     print('Embeddings Created')
    
#     # Create the vector store and persist it
#     print("Creating Chroma Vector Store...")
#     db = Chroma.from_documents(docs, embeddings, persist_directory=persistence_path)
#     print('Chroma Vector Store Created')
    
# else:
#     print("Chroma Vector Store already exists.")

import os
import json
from langchain_chroma import Chroma
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document

current_dir = os.path.dirname(__file__)
file_path = os.path.join(current_dir, 'studen.json')
persistence_path = os.path.join(current_dir, 'db', 'students_data')

if not os.path.exists(persistence_path):
    print("Persistence path does not exist. Creating one now...")
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(persistence_path), exist_ok=True)
    
    # Load the JSON file
    with open(file_path, 'r') as f:
        students_data = json.load(f)
    
    # Create Document objects - one document per student
    docs = []
    for student in students_data:
        # Convert the student record to a string
        student_json = json.dumps(student)
        
        # Create a Document object with metadata
        doc = Document(
            page_content=student_json,
            metadata={
                "student_id": str(student.get("_id", {}).get("$oid", "")),
                "name": student.get("name", ""),
                "skills": ", ".join(student.get("skills", [])),
                "interests": ", ".join(student.get("interests", []))
            }
        )
        docs.append(doc)
    
    # Displaying information about the documents
    print('\n----- Document Information -----')
    print(f'Number of documents: {len(docs)}')
    
    # Create Embeddings
    print('Creating Sentence Transformers Embeddings...')
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    print('Embeddings Created')
    
    # Create the vector store and persist it
    print("Creating Chroma Vector Store...")
    db = Chroma.from_documents(docs, embeddings, persist_directory=persistence_path)
    print('Chroma Vector Store Created')
    
else:
    print("Chroma Vector Store already exists.")