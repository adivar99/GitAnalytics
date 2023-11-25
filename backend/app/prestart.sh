#Check that the backend is working
python app/backend_pre_start.py

# Update alembic migrations
alembic upgrade head

# Create initial data
python /app/app/initial_data.py
