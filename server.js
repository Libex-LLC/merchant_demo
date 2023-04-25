const crypto = require("crypto");
const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
app.use(bodyParser.json());

// Generate Payment Url
app.post("/generate-payment-url", async (req, res) => {
  console.log("\nPAYMENT REQUEST");

  const amount = req.body.amount.toString(); // "50.00"
  // const notifyUrl = "http://my-api/notify";
  const notifyUrl = "https://3e18-102-22-252-97.ngrok-free.app/notify";
  const payoutCurrencyCode = "ZAR"; // only ZAR for now
  const isTest = false;
  const siteKey = "Site_One";

  // add values to payment request
  const payReq = {
    amount: amount,
    hashCheck: "",
    isTest: isTest,
    notifyUrl: notifyUrl,
    optional1: "",
    optional2: "",
    optional3: "",
    optional4: "",
    payoutCurrencyCode: payoutCurrencyCode,
    siteKey: siteKey,
  };

  // concat all variable in payReq in alphabetical order.
  let concatStr = "";
  for (const [_, value] of Object.entries(payReq)) {
    concatStr += value.toString();
  }
  // concatStr == 50.00falsehttp://localhost:8080/notifyZARSite_One

  // add your private key to the end of the concatStr
  concatStr += "my_very_secret_private_key";
  // concatStr == 50.00falsehttp://localhost:8080/notifyZARSite_Onemy_very_secret_private_key

  // lowercase concatStr and generate a hash
  concatStr = concatStr.toLowerCase();
  // concatStr == 50.00falsehttp://localhost:8080/notifyzarsite_onemy_very_secret_private_key
  console.log(concatStr);
  const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
  console.log(hashCheck);
  // hashCheck == 5d7c827384e8fa2993c9107706973f6d0757afd40d116c34cd68cfe94ae938c59a661a25e050847e171fc18ce676b1ea5c232f4e344b7e320e6acc31ad6cb0c9

  // add hashCheck to the payReq object
  payReq.hashCheck = hashCheck;

  // send payment request to our API to generate a payment url
  const payRes = await fetch(
    "https://api.libex.ai/merchant/generate/payment-url",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payReq),
    }
  );

  return res.status(payRes.status).send(await payRes.json());
});

// Normal http requests
app.post("/notify", (req, res) => {
  console.log("\nNOTIFICATION RECEIVED!");
  console.log(req.body);

  let concatStr = "";
  concatStr += req.body.amount;
  concatStr += req.body.amountReceived;
  concatStr += req.body.isTest.toString();
  concatStr += req.body.optional1;
  concatStr += req.body.optional2;
  concatStr += req.body.optional3;
  concatStr += req.body.optional4;
  concatStr += req.body.paymentId;
  concatStr += req.body.payoutCurrencyCode;
  concatStr += req.body.siteKey;
  concatStr += req.body.status;
  concatStr += req.body.statusMessage;
  concatStr += "my_very_secret_private_key";

  concatStr = concatStr.toLowerCase();
  console.log(concatStr);

  const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
  console.log(hashCheck);
  if (req.body.hashCheck !== hashCheck) {
    console.log("HashCheck failed!");
    return res.status(401);
  }

  // Use payment notification here ...

  console.log(req.body.status);
  return res.status(200);
});

const server = http.createServer(app);
//start our server
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port}`);
});
