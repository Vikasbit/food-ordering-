import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import engine, Base
from .seed_data import seed_db
from .routes import ai_routes, restaurant_routes, food_routes, order_routes, group_routes, dashboard_routes
from .websockets import ws_manager

# Seed database automatically on startup
try:
    seed_db()
except Exception as e:
    print("Seed notice:", e)

app = FastAPI(
    title="EATnaked - AI Food Ordering Platform API",
    description="Full-stack Python & Supabase backend powering natural language food discovery, live kitchen tracking, group ordering, and 22 feature suites.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routes
app.include_router(ai_routes.router)
app.include_router(restaurant_routes.router)
app.include_router(food_routes.router)
app.include_router(order_routes.router)
app.include_router(group_routes.router)
app.include_router(dashboard_routes.router)

# WebSocket Endpoints
@app.websocket("/ws/kitchen/{order_id}")
async def websocket_kitchen(websocket: WebSocket, order_id: str):
    await ws_manager.connect_kitchen(websocket, order_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_kitchen(websocket, order_id)

@app.websocket("/ws/group/{room_code}")
async def websocket_group(websocket: WebSocket, room_code: str):
    await ws_manager.connect_group(websocket, room_code)
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast_group_cart(room_code, data)
    except WebSocketDisconnect:
        ws_manager.disconnect_group(websocket, room_code)

# Static Files & Single Page App hosting
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=ROOT_DIR), name="static")

@app.get("/")
def read_root():
    index_path = os.path.join(ROOT_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "EATnaked Backend running successfully! Visit /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

