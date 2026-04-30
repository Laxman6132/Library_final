from fastapi import FastAPI, BackgroundTasks, HTTPException
import traceback
import pandas as pd
from sqlalchemy import create_engine
from recommender import compute_matrices, get_user_recommendations

app = FastAPI()

# Connect to MySQL (Change 'root', 'password', and 'library_db' to your actual credentials)
DB_URL = "mysql+pymysql://root:logi6132@localhost:3306/librarymanagement"
engine = create_engine(DB_URL)

# Global dictionary to hold the mathematical state in RAM
matrices = {}

def load_and_compute():
    print("Fetching fresh data from MySQL Database...")
    try:
        # Load directly from MySQL instead of CSVs
        books_df = pd.read_sql("SELECT book_id, genre, description FROM book", engine)
        interactions_df = pd.read_sql("SELECT user_id, book_id, interaction_type, rating, date_time FROM interaction", engine)
        
        if books_df.empty or interactions_df.empty:
            print("Warning: Database tables are empty. Cannot build models.")
            return

        # Pass the data to our math engine and store the results in our global dictionary
        matrices.update(compute_matrices(books_df, interactions_df))
        print("Matrices computed and updated successfully in RAM!")
        
    except Exception as e:
        print(f"[ERROR] Failed to build recommendation matrices:")
        traceback.print_exc()

@app.on_event("startup")
def startup_event():
    # Run the heavy lifting once when the server turns on
    load_and_compute()

@app.get("/recommend/user/{user_id}")
def recommend(user_id: int):
    # Safety check in case the DB failed to load
    if not matrices:
        raise HTTPException(status_code=503, detail="Recommendation engine is initializing or database is disconnected.")
    
    # Get the recommendations from RAM instantly
    recommended_ids = get_user_recommendations(user_id, matrices)
    
    return {
        "user_id": user_id,
        "recommended_book_ids": recommended_ids
    }

@app.post("/refresh")
def refresh_data(background_tasks: BackgroundTasks):
    # Spring Boot can call this endpoint to update the data without stopping the server
    background_tasks.add_task(load_and_compute)
    return {"message": "Data refresh started in the background."}