from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# 導入 PostgreSQL 相關模組
from postgres import postgres_router, close_postgres_connection

load_dotenv()

app = FastAPI(title="FastAPI Backend", version="1.0.0")

# CORS 設置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 連接
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongodb:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.testdb

# 註冊路由
app.include_router(postgres_router)

# Pydantic 模型
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemResponse(Item):
    id: str

class TestMessage(BaseModel):
    title: str
    content: str
    category: Optional[str] = "test"
    priority: Optional[str] = "normal"

class TestMessageResponse(TestMessage):
    id: str
    created_at: str

# 數據庫操作
async def get_collection():
    return db.items

async def get_test_messages_collection():
    return db.test_messages

@app.on_event("startup")
async def startup_db_client():
    print("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    # 關閉 PostgreSQL 連接池
    await close_postgres_connection()

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/hello")
async def hello_world():
    return {"message": "Hello World from FastAPI Backend!", "timestamp": "2024-01-01T00:00:00Z"}

@app.post("/test-messages/", response_model=TestMessageResponse)
async def create_test_message(message: TestMessage):
    from datetime import datetime
    collection = await get_test_messages_collection()
    
    # 添加創建時間
    message_data = message.dict()
    message_data["created_at"] = datetime.now().isoformat()
    
    result = await collection.insert_one(message_data)
    created_message = await collection.find_one({"_id": result.inserted_id})
    created_message["id"] = str(created_message["_id"])
    del created_message["_id"]
    return TestMessageResponse(**created_message)

@app.get("/test-messages/", response_model=List[TestMessageResponse])
async def read_test_messages():
    collection = await get_test_messages_collection()
    messages = []
    async for message in collection.find():
        message["id"] = str(message["_id"])
        del message["_id"]
        messages.append(TestMessageResponse(**message))
    return messages

@app.post("/test-messages/sample")
async def create_sample_test_message():
    """創建一個示例測試消息"""
    from datetime import datetime
    collection = await get_test_messages_collection()
    
    sample_message = {
        "title": "測試消息",
        "content": "這是一個從 FastAPI 後端寫入 MongoDB 的測試消息",
        "category": "test",
        "priority": "high",
        "created_at": datetime.now().isoformat()
    }
    
    result = await collection.insert_one(sample_message)
    created_message = await collection.find_one({"_id": result.inserted_id})
    created_message["id"] = str(created_message["_id"])
    del created_message["_id"]
    
    return {
        "message": "示例測試消息已成功寫入 MongoDB",
        "data": TestMessageResponse(**created_message)
    }

@app.post("/items/", response_model=ItemResponse)
async def create_item(item: Item):
    collection = await get_collection()
    result = await collection.insert_one(item.dict())
    created_item = await collection.find_one({"_id": result.inserted_id})
    created_item["id"] = str(created_item["_id"])
    del created_item["_id"]
    return ItemResponse(**created_item)

@app.get("/items/", response_model=List[ItemResponse])
async def read_items():
    collection = await get_collection()
    items = []
    async for item in collection.find():
        item["id"] = str(item["_id"])
        del item["_id"]
        items.append(ItemResponse(**item))
    return items

@app.get("/items/{item_id}", response_model=ItemResponse)
async def read_item(item_id: str):
    from bson import ObjectId
    collection = await get_collection()
    item = await collection.find_one({"_id": ObjectId(item_id)})
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    item["id"] = str(item["_id"])
    del item["_id"]
    return ItemResponse(**item)

@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    from bson import ObjectId
    collection = await get_collection()
    result = await collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# 舊的 PostgreSQL 測試端點已移至 /postgres/test
