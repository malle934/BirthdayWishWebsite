# 🌸 Birthday Wish Website

A heartfelt birthday surprise website with AWS serverless backend.

## 🔗 Live Demo
https://d1ih4dbo08ngk9.cloudfront.net/

## 🛠️ Tech Stack
### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Canvas API (flower animations)
- Custom SVG characters

### Backend (AWS)
- S3 + CloudFront (hosting + HTTPS)
- API Gateway (REST endpoint)
- Lambda + Python (serverless)
- DynamoDB (response storage)
- SNS (email notifications)

## 🏗️ Architecture

**Hosting Flow:**
Browser → CloudFront → S3

**Backend Flow:**
Browser → API Gateway → Lambda → DynamoDB + SNS

**Full Picture:**
```
User opens site
      ↓
 CloudFront (HTTPS)
      ↓
   S3 Bucket
   (HTML/CSS/JS/Photos/Music)
      ↓
 Friend clicks Always 💖
      ↓
 API Gateway
      ↓
  Lambda (Python)
   ↓          ↓
DynamoDB     SNS
(saves)   (emails you)
```

## ⚙️ Setup

1. Clone the repo
2. Rename `config.example.js` → `config.js`
3. Add your API URL in `config.js`:
```javascript
var CONFIG = {
  apiUrl: 'YOUR_API_GATEWAY_URL/prod/response'
};
```
4. Add your photos to the folder:
   - `friendsphoto.jpeg` → Miss You page
   - `friendsagain.webp` → BFF ring photo
   - `friendshipsaripoledha.png` → Always reveal
5. Add your music: `OhMyFriend.mp3`
6. Deploy all files to S3

## ☁️ AWS Setup

### Services Needed
| Service | Purpose |
|---|---|
| S3 | Store website files |
| CloudFront | HTTPS + fast delivery |
| API Gateway | REST API endpoint |
| Lambda | Python backend logic |
| DynamoDB | Store responses |
| SNS | Email notifications |

### Lambda Function
See `lambda_function.py` for the Python code.
Uses `boto3` — no extra packages needed.

### Environment
Update `TOPIC_ARN` and `TABLE_NAME` in `lambda_function.py`

## 📁 Project Structure
├── index.html            → all 6 scenes
├── styles2.css           → styling
├── app2.js               → logic + API calls
├── flowers.js            → flower animations
├── lambda_function.py    → AWS Lambda Python code
├── config.example.js     → API config template
├── .gitignore            → hides sensitive files
└── README.md

## 💰 AWS Cost
Practically **$0/month** — everything runs within AWS Free Tier limits.
