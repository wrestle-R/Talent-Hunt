from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from langchain.schema.output_parser import StrOutputParser
from langchain.prompts import ChatPromptTemplate
import os

load_dotenv()

def recommend_student(query):
    # Load the Chroma vector store for students
    current_dir = os.path.dirname(__file__)
    persistance_dir = os.path.join(current_dir, 'db', 'students_data')
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    db = Chroma(persist_directory=persistance_dir, embedding_function=embeddings)

    # Retrieve relevant documents
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
    relevant_docs = retriever.invoke(query)

    # Initialize the Mistral model
    model = ChatMistralAI(model='mistral-small-latest')

    # Debug the retrieved documents
    print("Retrieved documents:")
    for i, doc in enumerate(relevant_docs):
        print(f"Document {i + 1}:")
        print(doc.page_content)
        print("-" * 50)

    # Process document content to escape template variables by manually replacing
    processed_docs = []
    for doc in relevant_docs:
        # A safer approach to replace curly braces - simply double them up
        content = doc.page_content
        escaped_content = content.replace("{", "{{").replace("}", "}}")
        processed_docs.append(escaped_content)

    # Format the processed documents into a string
    relevant_docs_content = "\n\n".join(processed_docs)

    # Create a prompt template
    system_message = "You are a helpful assistant that suggests students based on their skills and interests."
    
    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("system", "Here are some relevant student profiles:"),
        ("system", relevant_docs_content),
        ("human", "{query}")
    ])

    # Create the chain
    chain = prompt | model | StrOutputParser()

    # Execute the chain
    response = chain.invoke({"query": query})

    return response

def recommend_mentor(query):
    # Load the Chroma vector store for mentors
    current_dir = os.path.dirname(__file__)
    persistance_dir = os.path.join(current_dir, 'db', 'mentors_data')
    embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')
    db = Chroma(persist_directory=persistance_dir, embedding_function=embeddings)

    # Retrieve relevant documents
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
    relevant_docs = retriever.invoke(query)

    # Initialize the Mistral model
    model = ChatMistralAI(model='mistral-small-latest')

    # Process document content to escape template variables by manually replacing
    processed_docs = []
    for doc in relevant_docs:
        # A safer approach to replace curly braces - simply double them up
        content = doc.page_content
        escaped_content = content.replace("{", "{{").replace("}", "}}")
        processed_docs.append(escaped_content)

    # Format the processed documents into a string
    relevant_docs_content = "\n\n".join(processed_docs)

    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that suggests mentors based on their skills and interests."),
        ("system", "Here are some relevant mentor profiles:"),
        ("system", relevant_docs_content),
        ("human", "{query}")
    ])

    # Create the chain
    chain = prompt | model | StrOutputParser()

    # Execute the chain
    response = chain.invoke({"query": query})

    return response

query = "I also need people who are good with data science and machine learning for a hackathon coming up soon"
print(recommend_student(query))