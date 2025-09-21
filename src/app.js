const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const routes = require('./routes/index');
const { initializeFirebase } = require('./config/firebase');
const gemRoutes = require('./routes/gemRoutes');
const jewelryTypeRoutes = require('./routes/jeweloryRoutes');
const jewelryRoutes = require('./routes/JewelryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const path = require('path');
const customizationRoutes = require('./routes/customizationRoutes'); // Changed to 
const customJewelleryRoutes = require('./routes/customJewelleryRoutes');
// lowercase
const orderRoutes = require('./routes/orderRoutes');
// Fix MaxListeners warning
process.setMaxListeners(0);

// Initialize Firebase with error handling
const initializeApp = async () => {
    try {
        console.log('🚀 Starting server initialization...');
        
        // Initialize Firebase
        await initializeFirebase();
        console.log('✅ Firebase connection established');
        
        // Middleware setup
        app.use(cors());
        app.use(bodyParser.json({limit: '10mb'})); // Increase limit to 10MB

        app.use('/upload', express.static(path.join(__dirname,'uploads')));
        app.use('/uploads', express.static(path.join(__dirname,'uploads')));
       
        // Routes setup
        app.use('/api', routes);
        app.use('/api/gems', gemRoutes);
        app.use('/api/jewelry', jewelryRoutes);
        app.use('/api/jewelry-types', jewelryTypeRoutes);
        app.use('/api/contact', contactRoutes);
        app.use('/api/customizations', customizationRoutes); // Add this line
        app.use('/api/order', orderRoutes);
        
app.use('/api/custom-jewellery-request', customJewelleryRoutes);

app.use('/api/contact', contactRoutes);

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('❌ Server Error:', err.stack);
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
            });
        });

        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({ 
                error: 'Route not found',
                path: req.originalUrl 
            });
        });

        // Start the server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        });

    } catch (error) {
        console.error('❌ Failed to initialize application:', error.message);
        process.exit(1);
    }
};

// Start the application
initializeApp();