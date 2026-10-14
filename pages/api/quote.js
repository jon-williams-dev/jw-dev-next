import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, bikeType, bikeInfo, pickup, dropoff, notes, lang, website } = req.body || {};

    // Honeypot filled in: pretend success so bots don't retry.
    if (website) {
        return res.status(200).json({ message: 'Quote request sent successfully.' });
    }

    const required = { name, email, bikeType, bikeInfo, pickup, dropoff };
    const tooLong = (v, max) => typeof v !== 'string' || v.length > max;
    if (Object.values(required).some((v) => !v || tooLong(v, 300)) || (notes && tooLong(notes, 3000))
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Missing or invalid fields' });
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
        replyTo: email,
        subject: `New Quote Request: (${bikeInfo})`,
        text: `You received a new transport request:

Name: ${name}
Email: ${email}
Motorcycle type: ${bikeType}
Motorcycle details: ${bikeInfo}
Pickup location: ${pickup}
Drop-off location: ${dropoff}
Notes: ${notes || 'N/A'}
Language: ${lang === 'de' ? 'German' : 'English'}

Please follow up with the customer.`,
    };

    const confirmation = {
        en: {
            from: 'JW Motorcycle Transport',
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
        },
        de: {
            from: 'JW Motorradtransport',
            subject: 'Ihre Transportanfrage ist eingegangen',
            text: `Guten Tag ${name},

vielen Dank für Ihre Anfrage! Ihre Anfrage für einen Motorradtransport ist bei mir eingegangen.

Hier eine Zusammenfassung Ihrer Angaben:
- Motorradtyp: ${{ Small: 'Klein', Medium: 'Mittel', Large: 'Groß' }[bikeType] || bikeType}
- Angaben zum Motorrad: ${bikeInfo}
- Abholort: ${pickup}
- Lieferort: ${dropoff}
- Anmerkungen: ${notes || '-'}

Ich prüfe Ihre Angaben und melde mich in Kürze mit einem Angebot bei Ihnen.

Mit freundlichen Grüßen
Jon (JW Motorradtransport)`,
        },
    }[lang === 'de' ? 'de' : 'en'];

    const confirmationMail = {
        from: { name: confirmation.from, address: process.env.EMAIL_USER },
        to: email,
        subject: confirmation.subject,
        text: confirmation.text,
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
