# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Set environment variable so Flask can run properly
ENV FLASK_APP=server.py
ENV FLASK_RUN_HOST=0.0.0.0

# Start the Flask server
CMD ["flask", "run"]