# PDF Studio

A full-stack PDF editing application with client-side editing for privacy and performance.

## Features
- **User Authentication**: Secure registration and login using Spring Security and JWT.
- **Document Management**: Upload, view, manage, and delete PDF documents.
- **Client-Side PDF Editing**: High-performance rendering via PDF.js and modification via pdf-lib.
- **Editing Tools**:
  - Text insertion and editing
  - Permanent whiteout rectangles
  - Signature drawing and placement
- **Advanced Controls**: Undo/redo history, zoom controls, multi-page navigation.
- **Export & Download**: Download modified PDFs with all annotations permanently embedded.

## Tech Stack
### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- PDF.js + pdf-lib
- Axios
- Lucide React
- React Hot Toast

### Backend
- Java 21 + Spring Boot
- Spring Security + JWT
- Spring Data JPA + MySQL
- Maven

## Prerequisites
- Java 21 JDK
- Node.js 20+
- MySQL 8.0+

## Getting Started

### 1. Database Setup
Create a MySQL database named `pdfstudio`:
```sql
CREATE DATABASE pdfstudio;
```

### 2. Backend Setup
Navigate to the backend directory and run:
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the dev server:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Environment Variables
- **Backend (`application.properties`)**: Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
- **Frontend (`.env`)**: Configure `VITE_API_URL=http://localhost:8080/api`.

## License
MIT
"# PDF_STUDIO" 
