# BeforeSalary Loan Application Website

A comprehensive loan application website built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform allows users to apply for various types of loans, manage their applications, and provides an admin panel for managing the entire system.

## Features

### User Features
- **Homepage** with hero banner and loan type showcase
- **Loan Products Pages** for Personal, Business, Home, Vehicle, and Education loans
- **Step-by-step Loan Application** with document upload and OTP verification
- **User Dashboard** with application status tracking and profile management
- **Informational Pages** (About Us, How It Works, Privacy Policy, Terms, FAQs, Blog)

### Admin Features
- **Admin Dashboard** with comprehensive statistics
- **Loan Application Management** (View, Approve, Reject)
- **Loan Product Management** (Create, Update, Delete loans)
- **Content Management** (Manage FAQs, Blog posts, Page content)
- **Settings Management** (Site settings, social media links, etc.)

### Additional Features
- Live chat integration
- WhatsApp integration
- Social media links
- Responsive design
- Dynamic content management through admin panel

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Nodemailer for emails
- Bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast
- Heroicons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beforesalary
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (Gmail)
# IMPORTANT: For Gmail, you MUST use an App Password, not your regular password!
# Steps to create Gmail App Password:
# 1. Go to your Google Account: https://myaccount.google.com/
# 2. Enable 2-Step Verification (if not already enabled)
# 3. Go to App Passwords: https://myaccount.google.com/apppasswords
# 4. Select "Mail" and your device, then click "Generate"
# 5. Copy the 16-character password (no spaces) and use it below
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Client directory:
```bash
cd Client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## Project Structure

```
Beforesalary website/
├── Client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main App component
│   └── package.json
├── Server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Server entry point
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Loans
- `GET /api/loans` - Get all loans
- `GET /api/loans/:slug` - Get loan by slug
- `POST /api/loans` - Create loan (Admin)
- `PUT /api/loans/:id` - Update loan (Admin)
- `DELETE /api/loans/:id` - Delete loan (Admin)

### Applications
- `GET /api/applications` - Get applications
- `POST /api/applications` - Create application
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications/:id/approve` - Approve application (Admin)
- `POST /api/applications/:id/reject` - Reject application (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

### Content
- `GET /api/content/:page` - Get page content
- `GET /api/content/faq/all` - Get all FAQs
- `GET /api/content/blog/all` - Get all blog posts
- `POST /api/content` - Create content (Admin)
- `PUT /api/content/:id` - Update content (Admin)

## Default Admin Account

After setting up the database, you'll need to create an admin user. You can do this by:

1. Registering a user normally
2. Updating the user's role to 'admin' in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Development

### Running in Development Mode

**Backend:**
```bash
cd Server
npm run dev
```

**Frontend:**
```bash
cd Client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd Client
npm run build
```

**Backend:**
```bash
cd Server
npm start
```

## Environment Variables

Make sure to set up all required environment variables in both `.env` files. Refer to the `.env.example` files for reference.

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or open an issue in the repository.


