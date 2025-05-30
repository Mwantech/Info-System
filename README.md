# Health Information System

A comprehensive healthcare management platform that allows doctors to create health programs, register clients, manage program enrollments, and expose client profiles via an API.

### Demo Login Credentials
The application has been deployed and can be accessed at:
[https://hospital-infosystem.netlify.app/](https://hospital-infosystem.netlify.app/)

You can use the following credentials to test the system:

```
Email: test@gmail.com
Password: Password@123
```

This account has doctor privileges and can access all features of the system.

## Features

The system enables healthcare providers to:

1. **Create Health Programs** - Set up programs such as TB, Malaria, HIV, etc.
2. **Register New Clients** - Add new patients to the system with their personal information
3. **Manage Program Enrollments** - Enroll clients in one or more health programs
4. **Search for Clients** - Efficiently find patients from the database
5. **View Client Profiles** - Access comprehensive client information and program enrollments
6. **Public API Access** - Securely expose client profiles to external systems

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
health-info-system/
├── hospital_management/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Main application screens
│       ├── services/         # API communication
│       ├── context/          # State management
│       └── utils/            # Helper functions
├── Backend/                   # Node.js backend
│   ├── config/               # Database and other configurations
│   ├── controllers/          # Request handlers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Custom middleware
│   └── server.js             # Main server file
└── package.json              # Project dependencies
```

## Security Considerations

- **Authentication Middleware**: All protected routes are secured with centralized authentication middleware
- **Rate Limiting**: Implemented on login attempts (5 tries) and public API endpoints
- **JWT Tokens**: Secure authentication with token expiration
- **Protected Routes**: Access control based on user roles
- **Limited Public Data**: Public API exposes only non-sensitive client information

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Mwantech/health-info-system.git
   cd health-info-system
   ```

2. Install backend dependencies:
   ```
   cd Backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../hospital_management
   npm install
   ```

4. Create a `.env` file in the Backend directory with the following variables:
   ```
   PORT=5500
   MONGO_URI=mongodb://localhost:27017/health-info-system
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   ```

### Running the Application

1. Start the backend server:
   ```
   cd Backend
   nodemon server.js
   ```

2. Start the frontend application in a new terminal:
   ```
   cd hospital_management
   npm run dev
   ```

3. Access the application at `http://localhost:3000`


### API Documentation

#### Authentication

- **POST /api/auth/login** - User login
- **POST /api/auth/logout** - User logout

#### Programs

- **GET /api/programs** - List all programs
- **POST /api/programs** - Create a new program
- **GET /api/programs/:id** - Get specific program details
- **PUT /api/programs/:id** - Update a program
- **DELETE /api/programs/:id** - Delete a program

#### Clients

- **GET /api/clients** - List all clients
- **POST /api/clients** - Register a new client
- **GET /api/clients/:id** - Get specific client details
- **PUT /api/clients/:id** - Update client information
- **DELETE /api/clients/:id** - Remove a client
- **GET /api/clients/search?query=...** - Search for clients

#### Enrollments

- **POST /api/clients/:id/programs** - Enroll a client in a program
- **DELETE /api/clients/:id/programs/:programId** - Remove client from a program

## Public Client Profile API

One of the key features of this system is the public API endpoint that allows external systems to access client profile information without authentication. This facilitates integration with other healthcare systems while maintaining data security.

### Client Profile Endpoint

```
GET /api/clients/:id/profile
```

### Parameters

| Parameter | Type   | Description                             | Required |
|-----------|--------|-----------------------------------------|----------|
| id        | String | MongoDB ObjectId of the client to fetch | Yes      |

### Example Request

```bash
curl -X GET https://yourdomain.com/api/clients/680bf1578be86f529f2c40e0/profile
```

### Response Format

A successful response will have HTTP status code 200 and return JSON data with the following structure:

```json
{
  "success": true,
  "data": {
    "id": "680bf1578be86f529f2c40e0",
    "firstName": "Jane",
    "lastName": "Smith",
    "gender": "female",
    "age": 45,
    "programs": [
      {
        "name": "Malaria",
        "description": "Diagnosing and treating malaria through awareness campaigns, distribution of insecticide-treated nets, access to rapid diagnostic tests",
        "status": "active",
        "enrollmentDate": "2025-04-25T20:32:37.003Z"
      }
    ]
  }
}
```

### Response Fields

| Field                | Type   | Description                                        |
|----------------------|--------|----------------------------------------------------|
| id                   | String | Client's unique identifier                         |
| firstName            | String | Client's first name                                |
| lastName             | String | Client's last name                                 |
| gender               | String | Client's gender (may be null if not provided)      |
| age                  | Number | Client's age calculated from date of birth         |
| programs             | Array  | List of programs the client is enrolled in         |
| programs.name        | String | Name of the program                                |
| programs.description | String | Brief description of the program                   |
| programs.status      | String | Enrollment status (active, completed, withdrawn)   |
| programs.enrollmentDate | String | ISO date when client enrolled in the program    |

### Error Responses

#### Client Not Found (404)

```json
{
  "success": false,
  "message": "Client not found"
}
```

#### Server Error (500)

```json
{
  "success": false,
  "message": "Error message details"
}
```

### Security Considerations for Public API

- Only non-sensitive client information is exposed
- No contact information or detailed personal records are accessible
- For security reasons, identifiable information is limited to first name, last name, gender, and age
- Full client details still require authentication and proper authorization

### Rate Limiting

To prevent abuse, this API endpoint has rate limiting in place:
- 100 requests per hour per IP address
- 1000 requests per day per IP address

Exceeding these limits will result in HTTP 429 (Too Many Requests) responses.

## Testing

Run the test suite with:

```
npm test
```

The system includes:
- Unit tests for backend services
- API endpoint tests
- React component tests

## Deployment

The application has been deployed and can be accessed at:
[https://hospital-infosystem.netlify.app/](https://hospital-infosystem.netlify.app/)

## Innovations and Optimizations

1. **Intelligent Search** - Client search with fuzzy matching for improved user experience
2. **Database Indexing** - Optimized MongoDB queries for faster client retrieval
3. **Caching** - Implemented response caching for frequently accessed data
4. **Rate Limiting** - Protects against brute force and DoS attacks
5. **Responsive Design** - Mobile-friendly interface for field usage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/Mwantech/Info-System](https://github.com/Mwantech/Info-System)