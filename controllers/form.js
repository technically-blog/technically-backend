const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = (req, res) => {
    const {email, name, message} = req.body;
    const emailData = {
        to: email,
        from: process.env.EMAIL_TO,
        subject: `Contact form - ${process.env.APP_NAME}`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <Sender message: ${message}</p>
            <hr />
            <p> This email may contain sensitive information</p>
            <p>https://technically.blog</p>`
    };
    console.log('SENDING MAIL...');
    sgMail.send(emailData, (error, result) => {
        if(error) {
            console.log(`${process.env.EMAIL_TO}`);
            console.log(`${error}`);
        } else {
            return res.json({
                success: true
            });
        }
    });

};