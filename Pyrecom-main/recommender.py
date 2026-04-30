import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def safe_minmax(series):
    """Prevents NaN if all scores are identical."""
    if series.empty or series.max() == series.min():
        return pd.Series(0.0, index=series.index)
    scaler = MinMaxScaler()
    return pd.Series(
        scaler.fit_transform(series.values.reshape(-1, 1)).flatten(),
        index=series.index
    )

def compute_matrices(books_df, interactions_df):
    """
    Takes raw DataFrames from main.py (MySQL) and returns the 32-bit optimized matrices.
    """
    # --- Content Features ---
    # Genre is stored as a plain comma-separated string e.g. "Fiction, History"
    # Split it into a proper list, strip whitespace from each genre name
    books_df['genre'] = books_df['genre'].apply(
        lambda x: [g.strip() for g in str(x).split(',')] if pd.notna(x) and str(x).strip() else []
    )
    mlb = MultiLabelBinarizer()
    genre_array = np.array(mlb.fit_transform(books_df['genre']), dtype=np.float32)
    genre_features = pd.DataFrame(genre_array, columns=mlb.classes_, index=books_df['book_id'])

    books_df['description'] = books_df['description'].fillna('')
    tfidf = TfidfVectorizer(stop_words='english', max_features=1000, dtype=np.float32)
    tfidf_matrix = tfidf.fit_transform(books_df['description'])
    tfidf_features = pd.DataFrame(tfidf_matrix.toarray(), index=books_df['book_id'])

    content_features = pd.concat([genre_features, tfidf_features], axis=1).fillna(0)

    # --- Collaborative Features ---
    interactions_df['date_time'] = pd.to_datetime(interactions_df['date_time'])
    interaction_weights = {'viewed': 1.0, 'favourite': 2.5, 'issued': 4.0, 'review': 5.0}
    interactions_df['implicit_weight'] = interactions_df['interaction_type'].map(interaction_weights)

    interactions_df['combined_score'] = np.where(
        interactions_df['rating'] > 0, interactions_df['rating'], interactions_df['implicit_weight']
    )

    current_date = interactions_df['date_time'].max()
    interactions_df['days_old'] = (current_date - interactions_df['date_time']).dt.days
    interactions_df['decay_weight'] = np.exp(-np.log(2) * interactions_df['days_old'] / 180)

    interactions_df['final_score'] = (interactions_df['combined_score'] * interactions_df['decay_weight']).astype(np.float32)

    user_item_matrix = interactions_df.pivot_table(
        index='user_id', columns='book_id', values='final_score', aggfunc='sum'
    ).fillna(0)

    collaborative_similarity = cosine_similarity(user_item_matrix.T).astype(np.float32)
    collab_sim_df = pd.DataFrame(collaborative_similarity, index=user_item_matrix.columns, columns=user_item_matrix.columns)

    trending_books = interactions_df.groupby('book_id')['final_score'].sum().sort_values(ascending=False).index.tolist()

    # Package everything up to send back to main.py's RAM
    return {
        'content_features': content_features,
        'collab_sim_df': collab_sim_df,
        'user_item_matrix': user_item_matrix,
        'trending_books': trending_books
    }

def get_user_recommendations(user_id, matrices, top_n=8, content_weight=0.5, collab_weight=0.5):
    """
    Executes the recommendation logic using the pre-computed matrices passed from main.py.
    """
    # Unpack the matrices from RAM
    content_features = matrices['content_features']
    collab_sim_df = matrices['collab_sim_df']
    user_item_matrix = matrices['user_item_matrix']
    trending_books = matrices['trending_books']

    if user_id not in user_item_matrix.index:
        return trending_books[:top_n]

    user_history = user_item_matrix.loc[user_id]
    interacted_books = [b for b in user_history[user_history > 0].index.tolist() if b in content_features.index]

    if len(interacted_books) < 2:
        return [b for b in trending_books if b not in interacted_books][:top_n]

    collab_scores = collab_sim_df.dot(user_history)

    user_interacted_features = content_features.loc[interacted_books]
    user_profile_vector = user_interacted_features.T.dot(user_history.loc[interacted_books])
    
    content_sim_array = cosine_similarity(content_features, user_profile_vector.values.reshape(1, -1)).flatten()
    content_scores = pd.Series(content_sim_array, index=content_features.index)

    collab_scaled = safe_minmax(collab_scores)
    content_scaled = safe_minmax(content_scores)

    content_scaled, collab_scaled = content_scaled.align(collab_scaled, fill_value=0)
    hybrid_scores = (content_scaled * content_weight) + (collab_scaled * collab_weight)
    
    hybrid_scores = hybrid_scores.drop(interacted_books, errors='ignore')
    results = hybrid_scores.sort_values(ascending=False).head(top_n).index.tolist()

    if not results:
        return trending_books[:top_n]

    return results