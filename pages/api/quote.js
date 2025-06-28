import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, bikeType, bikeInfo, pickup, dropoff, notes } = req.body;

    if (!name || !email || !bikeInfo || !pickup || !dropoff) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email to you
    const internalMail = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // send to yourself
        subject: `🛵 New Quote Request: (${bikeInfo})`,
        text: `You received a new transport request:

Name: ${name}
Email: ${email}
Motorcycle type: ${bikeType}
Motorcycle details: ${bikeInfo}
Pickup location: ${pickup}
Drop-off location: ${dropoff}
Notes: ${notes || 'N/A'}

Please follow up with the customer.`,
    };

    // Confirmation email to user
    const confirmationMail = {
        from: 'no-reply@yourdomain.com',
        to: email,
        subject: 'Your transport request has been received',
        text: `Hi ${name},

Thanks for getting in touch! Your motorcycle transport request has been received.

Here’s a summary of what you submitted:
- Motorcycle type: ${bikeType}
- Motorcycle details: ${bikeInfo}
- Pickup location: ${pickup}
- Drop-off location: ${dropoff}
- Notes: ${notes || 'N/A'}

I’ll review the details and get back to you soon with a quote.

Best regards,  
Jon (JW Motorcycle Transport)`,
    };

    try {
        await transporter.sendMail(internalMail);
        await transporter.sendMail(confirmationMail);

        return res.status(200).json({ message: 'Quote request sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email.' });
    }
}
