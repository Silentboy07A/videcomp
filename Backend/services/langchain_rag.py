from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile"
)

prompt = PromptTemplate.from_template(
    """
Context:
{context}

Question:
{question}

Answer only using the provided context.
"""
)

chain = prompt | llm

def generate_rag_answer(question, context):
    response = chain.invoke(
        {
            "context": context,
            "question": question
        }
    )

    return response.content