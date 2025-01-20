# api/db/mongodb.py
from pymongo import MongoClient
from pymongo.collection import Collection
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "transcriptions")

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

def get_db():
    return db
