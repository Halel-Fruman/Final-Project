# Ilan Israel E-Commerce Platform 🛒

A comprehensive, modern e-commerce platform built with React.js and Node.js, featuring advanced store management, AI-powered chatbot, and multi-language support. This full-stack application serves as a marketplace for ILAN Israel, supporting multiple stores and vendors.

## 🌟 Key Features

### 🛍️ **Customer Experience**
- **Modern Shopping Interface**: Responsive design with product browsing, filtering, and search
- **Smart Cart & Wishlist**: Persistent shopping cart and wishlist functionality
- **Multi-language Support**: Full Hebrew and English localization (RTL/LTR)
- **AI-Powered Chatbot**: Intelligent assistant with voice input and image recognition
- **Secure Checkout**: Integrated payment processing with Tranzila
- **Voice Shopping**: Speech recognition for hands-free browsing

### 🏪 **Multi-Store Management**
- **Store Dashboard**: Comprehensive analytics and revenue tracking
- **Product Management**: Advanced inventory management with image uploads
- **Order Processing**: Real-time order tracking and status updates
- **Analytics & Reports**: Revenue charts, sales statistics, and Excel exports
- **Store Settings**: Customizable store profiles and delivery options

### 👨‍💼 **Admin Panel**
- **System Administration**: Complete platform oversight and management
- **User Management**: Role-based access control (Admin, Store Manager, Customer)
- **Category Management**: Dynamic product category system
- **Store Approval**: New store registration and approval workflow
- **Global Promotions**: Site-wide promotional campaigns
- **Analytics Dashboard**: Platform-wide statistics and insights

### 🤖 **AI Features**
- **Intelligent Chatbot**: Context-aware conversations with role-based responses
- **Image Recognition**: Product identification through image uploads
- **Voice Commands**: Speech-to-text functionality for accessibility
- **Automated Assistance**: Smart product recommendations and help

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework with hooks and lazy loading
- **React Router DOM** - Client-side routing with protected routes
- **Tailwind CSS** - Utility-first styling with RTL support
- **Framer Motion** - Smooth animations and transitions
- **React i18n** - Internationalization and localization
- **Axios** - HTTP client with token refresh mechanism
- **React Hot Toast** - Beautiful notification system

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT Authentication** - Secure token-based authentication
- **bcrypt** - Password hashing and security
- **Nodemailer** - Email notifications and verification
- **OpenAI Integration** - AI-powered chatbot responses
- **Multer & Sharp** - Image upload and processing

### Additional Tools
- **PostCSS** - CSS processing and optimization
- **XLSX** - Excel export functionality
- **date-fns** - Date manipulation utilities
- **React Icons & FontAwesome** - Comprehensive icon sets
- **Recharts** - Data visualization and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB database
- OpenAI API key (for chatbot)
- Email service credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Halel-Fruman/Final-Project.git
   cd Final-Project
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd DataBase
   npm install
   ```

4. **Environment Configuration**

   Create `.env` in the `DataBase` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

5. **Start the application**

   Backend (from DataBase folder):
   ```bash
   npm start
   # or for development
   npm run dev
   ```

   Frontend (from root folder):
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Final-Project/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Header/              # Navigation header
│   │   ├── Footer/              # Site footer
│   │   ├── Product/             # Product-related components
│   │   └── chatbotFolder/       # AI chatbot components
│   ├── pages/                   # Page components
│   │   ├── HomePage/            # Landing page
│   │   ├── PersonalArea/        # User account management
│   │   ├── StoreManagement/     # Store owner dashboard
│   │   ├── SysAdmin/            # Admin panel
│   │   └── Checkout/            # Payment processing
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Helper utilities
│   └── locales/                 # i18n language files
├── DataBase/                    # Backend Node.js application
│   ├── Controllers/             # Business logic handlers
│   ├── models/                  # MongoDB schemas
│   ├── Routes/                  # API endpoint definitions
│   └── Middleware/              # Authentication & authorization
└── public/                      # Static assets
```

## 🔐 User Roles & Permissions

### 👤 **Customer**
- Browse and search products
- Add items to cart and wishlist
- Place orders and track delivery
- Manage personal account
- Use AI chatbot assistance

### 🏪 **Store Manager**
- Full store management dashboard
- Product inventory control
- Order and transaction monitoring
- Store analytics and reporting
- Customer communication tools

### 👨‍💻 **System Administrator**
- Platform-wide management
- User role assignments
- Store approval and monitoring
- Global promotional campaigns
- System analytics and reports

## 🌍 Internationalization

The platform supports full Hebrew and English localization with:
- **RTL/LTR Layout Support**: Automatic layout direction switching
- **Dynamic Language Loading**: Lazy-loaded translation files
- **Formatted Dates & Numbers**: Locale-aware formatting
- **SEO Optimization**: Language-specific meta tags and URLs

## 📱 Responsive Design

- **Mobile-First Approach**: Optimized for all screen sizes
- **Touch-Friendly Interface**: Mobile gesture support
- **Progressive Web App**: Installable and offline-capable
- **Performance Optimized**: Lazy loading and code splitting

## 🤖 AI-Powered Features

### Intelligent Chatbot
- **Natural Language Processing**: Understands user intents
- **Role-Based Responses**: Contextual answers based on user permissions
- **Multi-Modal Input**: Text, voice, and image support
- **Action Automation**: Can perform tasks like adding products to cart

### Image Recognition
- **Product Identification**: Upload images to find similar products
- **Smart Search**: Visual product discovery
- **Inventory Matching**: Automated product cataloging

## 📊 Analytics & Reporting

- **Revenue Tracking**: Real-time sales monitoring
- **Customer Analytics**: User behavior insights
- **Inventory Reports**: Stock level monitoring
- **Performance Metrics**: Platform usage statistics
- **Export Capabilities**: Excel and CSV data export

## 🔒 Security Features

- **JWT Authentication**: Secure token-based login system
- **Role-Based Access Control**: Granular permission management
- **Password Encryption**: bcrypt hashing for security
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: XSS and injection prevention
- **HTTPS Enforcement**: Secure data transmission

## 🚀 Deployment

The application is configured for deployment with:
- **Production Build**: Optimized React build process
- **Environment Variables**: Secure configuration management
- **Static Asset Serving**: Efficient file delivery
- **Database Indexing**: Optimized MongoDB queries
- **Monitoring Ready**: Error tracking and performance monitoring

## 👥 Authors

- **Halel Fruman** - [@Halel-Fruman](https://github.com/Halel-Fruman)
- **Daniel Ben Tov** - [@danielBenTov26](https://github.com/danielBenTov26)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ILAN Israel organization for the project inspiration
- OpenAI for chatbot capabilities
- React and Node.js communities for excellent documentation
- All contributors and testers

---

**⭐ Star this repository if you find it helpful!**

*Built with ❤️ for ILAN Israel*