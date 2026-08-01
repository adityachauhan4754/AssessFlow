#!/bin/bash

# Configuration
API_URL=${1:-"http://localhost:5000/api"}
COOKIE_JAR="cookies.txt"

echo "Running Smoke Tests against $API_URL..."

# 1. Register
echo -e "\n[1] Registering User..."
curl -s -c $COOKIE_JAR -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","email":"smoke@example.com","password":"Password123!"}' | jq .

# 2. Login
echo -e "\n[2] Logging In..."
curl -s -c $COOKIE_JAR -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","password":"Password123!"}' | jq .

# 3. Create Assessment
echo -e "\n[3] Creating Assessment..."
ASSESSMENT_RESP=$(curl -s -b $COOKIE_JAR -X POST "$API_URL/assessment" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smoke Test Assessment",
    "description": "Testing from CLI",
    "categories": [
      {
        "name": "Category 1",
        "factors": [
          {
            "name": "Factor 1",
            "questions": [
              { "text": "Q1", "type": "Text" }
            ]
          }
        ]
      }
    ]
  }')
echo $ASSESSMENT_RESP | jq .
ASSESSMENT_ID=$(echo $ASSESSMENT_RESP | jq -r '._id')

# 4. Submit Response
echo -e "\n[4] Submitting Response..."
curl -s -b $COOKIE_JAR -X POST "$API_URL/response" \
  -H "Content-Type: application/json" \
  -d "{
    \"assessmentId\": \"$ASSESSMENT_ID\",
    \"respondentName\": \"Test User\",
    \"answers\": [
      { \"questionId\": \"123456789012345678901234\", \"value\": \"Test Answer\" }
    ]
  }" | jq .

echo -e "\nSmoke Tests Completed."
rm $COOKIE_JAR
