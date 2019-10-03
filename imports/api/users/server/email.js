import { Email } from 'meteor/email';

export const welcomeEmail = (name, to) => {
    const subject = `Welcome To Naao ${name}`;
    const text = `Hey ${name},\nWe're super glad to have you onboard!\nFeel free to let us know if you have any feedback.\n\nRegards\nNaao Team`;

    try {
        const emailRes = Email.send({ to, from: 'no-reply@naao.delivery', subject, text });
        console.log(emailRes);
        return emailRes ;
    } catch (err) {
        console.log('error sending welcome email', err);
        return null;
    }
};