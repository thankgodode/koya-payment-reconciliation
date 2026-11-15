// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
const clean_trx = {}
for (const line of lines) {
  try {
    const event = JSON.parse(line);

    if(event.txn_id && event.status && event.ts && event.currency){
      if (clean_trx[event.txn_id]){
        let d1 = new Date(clean_trx[event.txn_id].ts)
        let d2 = new Date(event.ts);
        
        if (d1>d2){
          continue
        }else{
          clean_trx[event.txn_id] = event;
        }
      }else{
        clean_trx[event.txn_id] = event
      }
    }

  } catch (error) {
    continue
  }

}


for (const txn in clean_trx){
  let event = clean_trx[txn]
  if(event.status === "success"){
    total += typeof event.amount === "string" ?
      Number(event.amount.replace(",","")) : Number(event.amount)
    count+=1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
