/*
 * emails
 * https://github.com/steffenix/emails
 *
 * Copyright (c) 2013 steffel fenix
 * Licensed under the MIT license.
 */

var nodemailer=require('nodemailer')

//connect away


var send = function(req,res,next) {
    var Key = req.input.apikey;
    if(Key!=process.env.OPENSHIFT_MAILAPI_KEY)
    {
        res.end(Key+' is an invalid API key')
    }
    else
    {
        var Tag = req.body.Tag;
        var smtpTransport = nodemailer.createTransport("SMTP",{host:process.env.SMTP_SERVER,port:25});

        var now = new Date();
        var mailOptions = {
            from:  req.body.From, 
            to: req.body.To,
            cc: req.body.Cc,
            bcc: req.body.Bcc,
            replyto : req.body.ReplyTo,
            subject: req.body.Subject, 
            text: req.body.TextBody, 
            html: req.body.HtmlBody,
        }
        var toSave = {
            from:  req.body.From, 
            to: req.body.To,
            cc: req.body.Cc,
            bcc: req.body.Bcc,
            replyto : req.body.ReplyTo,
            subject: req.body.Subject, 
            tag: req.body.tag,
            date: now.toJSON()
        }
        console.log(toSave)
        
        

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.send(error.toString());
        }else{
            console.log("Message sent: " + response.message);
            res.send("Message sent: " + response.message.toString());

        }
            smtpTransport.close();
        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
    }
}
    module.exports = {
      send : send
    };