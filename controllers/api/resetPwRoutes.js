const router = require('express').Router();
const { User } = require('../../models');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Request password reset
router.post('/reset-request', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 15; // 15 mins

    await user.update({ resetToken: token, resetTokenExpires: expires });

    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    console.log("🔗 Reset link:", resetLink);


    // Send email (using dummy SMTP for now)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        html: `<p>Click to reset: <a href="${resetLink}">${resetLink}</a></p>`
    });

    res.json({ message: 'Password reset link sent' });
});



// Submit new password
router.post('/reset-password/:token', async (req, res) => {
    const user = await User.findOne({
        where: {
            resetToken: req.params.token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!user) return res.status(400).send('Invalid or expired token');

    // ✅ Let the model's beforeUpdate hook handle the hashing
    await user.update({
        password: req.body.password,
        resetToken: null,
        resetTokenExpires: null
    });

    res.send('Password successfully updated. You may now log in.');
});


module.exports = router;
