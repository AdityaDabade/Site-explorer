# TourVision Wiring Test Guide

## Test 1 - Auth
1. Start MongoDB, the backend on `http://localhost:5000`, the frontend on `http://localhost:5173`, and the ML service on `http://localhost:8000`.
2. `POST /api/auth/signup` with:
```json
{
  "name": "Test Traveler",
  "email": "tester@example.com",
  "password": "secret123"
}
```
3. Expect:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "email": "tester@example.com"
    }
  }
}
```
4. `POST /api/auth/login` with the same `email` and `password`.
5. Expect: `success: true` with `data.token` and `data.user`.
6. `GET /api/auth/me` with `Authorization: Bearer <token>`.
7. Expect:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "tester@example.com"
    }
  }
}
```

## Test 2 - Places
1. `GET /api/places?lat=26.9&lng=75.8&radius=10`
2. Expect:
```json
{
  "success": true,
  "data": {
    "places": [],
    "total": 0
  }
}
```
3. `GET /api/places/:id`
4. Expect `success: true` and `data.place.ar_model_url` to exist even if empty.

## Test 3 - QR Scan
1. `POST /api/qr/scan`
```json
{
  "qr_data": "test_qr_123"
}
```
2. Expect:
```json
{
  "success": true,
  "data": {
    "place_id": "..."
  }
}
```

## Test 4 - Geofence
1. `POST /api/places/:id/geofence`
```json
{
  "lat": 26.9,
  "lng": 75.8
}
```
2. Expect:
```json
{
  "success": true,
  "data": {
    "inside": true,
    "zone": "inside"
  }
}
```

## Test 5 - Chat
1. `POST /api/chat/message`
```json
{
  "message": "Tell me about this fort",
  "place_id": "...",
  "geofence_zone": "main_entrance"
}
```
2. Expect:
```json
{
  "success": true,
  "data": {
    "reply": "...",
    "tts_audio_url": ""
  }
}
```
3. `GET /api/chat/history/:placeId`
4. Expect:
```json
{
  "success": true,
  "data": {
    "history": []
  }
}
```

## Test 6 - Trip Plan
1. `POST /api/trip/plan`
```json
{
  "destinations": ["Jaipur", "Agra"],
  "duration": 3,
  "transport": "train",
  "members": {
    "adults": 2,
    "children": 0
  }
}
```
2. Expect:
```json
{
  "success": true,
  "data": {
    "route": {},
    "cost_estimate": 0,
    "alerts": []
  }
}
```
3. `POST /api/trip/:id/expenses`
```json
{
  "title": "Taxi",
  "amount": 500,
  "participants": ["Aditi", "Rohan"]
}
```
4. Expect `success: true` and `data.expense`.
5. `GET /api/trip/:id/expenses/split`
6. Expect `success: true` and `data.split.per_person`.

## Test 7 - ML Image Recognition
1. `POST http://localhost:8000/recognize` with a multipart image field named `image`.
2. Expect:
```json
{
  "name": "Amber Fort",
  "facts": ["..."],
  "confidence": 0.95
}
```

## Test 8 - Socket
1. Connect the frontend to `ws://localhost:5000/socket.io`.
2. Trigger an AI content generation job or any queued heavy job.
3. Expect `job:progress` payloads shaped like:
```json
{
  "jobId": null,
  "percent": 20,
  "status": "Generating AI content for ..."
}
```
4. Trigger `POST /api/chat/message` while authenticated.
5. Expect `guide:narration` payloads shaped like:
```json
{
  "place_id": "...",
  "audio_url": "",
  "caption": "..."
}
```
