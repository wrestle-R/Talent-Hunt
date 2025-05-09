import os
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

current_dir = os.path.dirname(__file__)
file_path = os.path.join(current_dir, 'mentors.json')
persistance_path = os.path.join(current_dir, 'db', 'mentors_data')

if not os.path.exists(persistance_path):
    print("Persistance path does not exist. Creating one now...")

    loader = JSONLoader(file_path, jq_schema='.[]', text_content=False)
    data = loader.load()

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(data)

    # Displaying information about the chunks
    print('\n ----- Document Chunks Information -----')
    print(f'Number of documents: {len(docs)}')
    print(f'Sample Chunk: \n {docs[0].page_content}\n')

   # Create Embeddings using HuggingFace's wrapper for sentence-transformers
    print('Creating Sentence Transformers Embeddings...')
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    print('Embeddings Created: ')

    # create the vector store and persist it automatically
    print("Creating Chroma Vector Store...")
    db = Chroma.from_documents(docs, embeddings, persist_directory=persistance_path)
    print('Chroma Vector Store Created')

else:
    print("Chroma Vector Store already exists.")