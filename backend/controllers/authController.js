const crypto = require('crypto');
const user = require('../model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utility function to check password strength

exports.register = async (req, res) => {
    try {
        console.log("Incoming registration body:", req.body);
        const { username, email, password } = req.body;

        if (!(username && email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newuser = await user.create({
            username,
            email,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: newuser._id,
                username: newuser.username,
                email: newuser.email,
                role: newuser.role,
            },
            process.env.SECRET_KEY,
            { expiresIn: "24h" }
        );

        // Set the token in an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Exclude password from user object
        newuser.password = undefined;

        res.status(200).json({
            message: 'You have successfully registered!',
            user: newuser
        });

    } catch (error) {
        console.error("Register route error:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(404).send("User not found");
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).send("Invalid credentials");
        }

        const token = jwt.sign(
            {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
            },
            process.env.SECRET_KEY,
            { expiresIn: "24h" }
        );

    // Set the token in an HttpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/' // Ensure cookie is available for all paths
    });

        // Exclude password from user object
        existingUser.password = undefined;

        res.status(200).json({
            message: "You have successfully logged in!",
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role,
            },
        });
    } catch (error) {
        console.error("Login route error:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// Logout route - clears the authentication cookie
exports.logout = (req, res) => {
   // And in logout function:
res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
});
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.status = async (req, res) => {
    try {
        const { id, username, email, role } = req.user;
       
        const dbUser = await user.findById(id);
        if (!dbUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            isLoggedIn: true,
            user: { id, username, email, role, greenCoins: dbUser.greenCoins,carbonFootprintSaved: dbUser.carbonFootprintSaved}

        });
    } catch (error) {
        res.status(500).json({ isLoggedIn: false, message: "Failed to get auth status" });
    }
};