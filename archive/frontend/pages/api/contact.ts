// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: 'hamilton.aodhan@gmail.com', // Support email to send the contact form Data to.
    from: 'hamilton.aodhan@gmail.com', // / Use the email address or domain you verified above
    subject: 'Pharmakhama Contact',
    html: `<div>From: ${req.body.name}<br>
    Email: ${req.body.email}<br>
    Message: ${req.body.message} </div>`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({ message: 'Message successfully Sent' });
}
