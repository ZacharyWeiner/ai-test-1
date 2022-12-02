import Head from "next/head";
import { useEffect, useState } from "react";
import generateIdea from "./api/generateIdea";
import styles from "./index.module.css";

export default function Home() {
  const [ideaThemelInput, setIdeaThemeInput] = useState("");
  const [businessType, setBusinessType] = useState("random");
  const [result, setResult] = useState();
  const [ideaResult, setIdeaResult] = useState();
  const [storyIdeaInput, setStoryIdeaInput] = useState("");
  const [storyIdeaResult, setStoryIdeaResult] = useState("");
  const [hasTwechWallet, setHasTwetchWallet] = useState(false)
  const [hasSensiletWallet, setHasSensiletWallet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [solanaUserKey, setSolanaUserKey] = useState(false)
  const [dataFinishReason, setDataFinishReason] = useState(false)
  
  useEffect(()=>{
    console.log({window})
    if ("bitcoin" in window) {
      console.log("Bitcoin is in the HOUSE!")
      const provider = window.bitcoin;
      if (provider.isTwetch) {
        console.log("TWETCH is in the HOUSE!")
        setHasTwetchWallet(true);
        return provider;
      }
    }
    //window.open("https://twetch.com/downloads", "_blank");
  }, [])

  useEffect(()=>{
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      console.log("SOLANA is in the HOUSE!")
      if (provider?.isPhantom) {
        console.log("PHANTOM is in the HOUSE!")
        return provider;
      }
    }
  
    // window.open('https://phantom.app/', '_blank');
  }, [])

  useEffect(()=>{
    if ('sensilet' in window) {
      const provider = window.sensilet
      console.log("SENSILET is in the HOUSE!")
      setHasSensiletWallet(true)
    }
  
    // window.open('https://chrome.google.com/webstore/detail/sensilet/aadkcfdlmiddiiibdnhfbpbmfcaoknkm', '_blank');
  }, [])

  
  async function tryAgain(event){
    setResult("")
    await onSubmit(event);
  }
  function clearStory() {
    setStoryIdeaInput("");
  }

  async function payWithTwetch(){
    try {
      const resp = await window.bitcoin.connect();
      console.log(resp.publicKey.toString());
      console.log(resp.paymail.toString());
    } catch (err) {
      alert(err);
    }
    let  paymentResponse;
    try{
       paymentResponse = await window.twetch.abi({
          contract: 'payment',
          outputs: [{
            to: '16015@twetch.me',
            sats: 100000
          }]
        });
    }
    catch(err){
      console.log(err.action);
      return false;
    }
    console.log(paymentResponse.actionId)
    return true
  }
  async function payWithSensilet(){
    try {
      const resp = await window.sensilet.requestAccount();
      console.log(resp.address);
    } catch (err) {
      alert(err);
    }
    let  paymentResponse;
    try{
       paymentResponse = await window.sensilet.transferBsv({
        receivers:[
          {
            address:"1EhuKT23ctLrmiyfVqF6Bsqyh8vxnYqWbY",
            amount:10000
          }
        ]
      });
    }
    catch(err){
      console.log(err.action);
      return false;
    }
    console.log(paymentResponse)
    return true
  }
  async function payWithPhantom(){
    const provider = getProvider(); // see "Detecting the Provider"
    try {
        const resp = await provider.request({ method: "connect" });
        console.log(resp.publicKey.toString());
        setSolanaUserKey(resp.publicKey.toString())
    } catch (err) {
        console.log(err);
        return false;
    }
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 10,
      }),
    ];
    
    // create v0 compatible message
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();
    
    // make a versioned transaction
    const transactionV0 = new VersionedTransaction(messageV0);
  }

  async function pay(){
    let paid = false;
    const isTwetchInstalled = window.bitcoin && window.bitcoin.isTwetch
    const isPhantomInstalled = window.phantom?.solana?.isPhantom
    const isSensiletInstalled = window.sensilet !== 'undefined';
    if(isTwetchInstalled){ paid = await payWithTwetch()}
    else if(isPhantomInstalled){  paid = await payWithPhantom()}
    else if(isSensiletInstalled){paid = payWithSensilet()}
    
    return paid;
  }

  async function onSubmit(event) {
    setLoading(true)
    event ? event.preventDefault():  console.log("no event");
    let paid = false; 
    paid = await pay();
    if(!paid){
      alert("Payment Failed. Wh0mp Wh0mp.")
      setLoading(false);
      return
    }
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({previous: result, what: ideaResult}),
    });
    const data = await response.json();
    if(result){setResult(result + data.result);}
    else{setResult(data.result);}
    setLoading(false)
  }
  async function generateIdea(){
    event.preventDefault();
    setLoading(true)
    let paid = false;
    paid = await pay();
    if(!paid){
      console.log("Payment Failed")
      return;
    }
    setResult("")
    const response = await fetch("/api/generateIdea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({about: ideaThemelInput, businessType: businessType}),
    });
    const data = await response.json();
    setIdeaResult(data.result);
    console.log("The finish reason is:", data.finish_reason)
    setDataFinishReason(data.finish_reason);
    setLoading(false)
  }
  async function generateStory(){
    event.preventDefault();
    setLoading(true)
    try {
      const resp = await window.bitcoin.connect();
      console.log(resp.publicKey.toString())
      console.log(resp.paymail.toString())
      
    } catch (err) {
      alert(err);
      return;
    }
   let paid = false
   paid = await pay();
    setResult("")
    const response = await fetch("/api/generateStory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({description: storyIdeaInput, previous: storyIdeaResult}),
    });
    const data = await response.json();
    setStoryIdeaResult(data.result);
    setDataFinishReason(data.finish_reason);
    setLoading(false)
  }
  function handleOptionChange(changeEvent) {
    setBusinessType(changeEvent.target.value);
  }
  
  return (
    <div>
    {loading ? "Loading ..." : ""}
    <div> 
    {
      (hasTwechWallet || hasSensiletWallet ) ? "" : 
      <div style={{"margin": "24px", "textAlign": "right" }}>
        <a style={{"display": "inline", "margin": "6px"}} className={styles.walletButton} href="https://chrome.google.com/webstore/detail/sensilet/aadkcfdlmiddiiibdnhfbpbmfcaoknkm" target="_blank" > Get Sensilet Wallet</a>
        <a style={{"display": "inline", "margin": "6px"}} className={styles.walletButton} href="https://twetch.com/downloads" target="_blank" > Get Twetch Wallet</a>
      </div>
    }
    </div>
      <Head>
        <title>Command The AI</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
          <img src="/dog.png" className={styles.icon} />
          <h3>Create A Business Idea</h3>
          <form >
          <div>
            <input type="radio" id="contactChoice34"
            name="contact" value="random" checked={businessType=== 'random'} onChange={handleOptionChange}/>
            <label >Random</label>
            <input type="radio" id="contactChoice1"
            name="contact" value="online"  checked={businessType=== 'online'} onChange={handleOptionChange}/>
            <label >Online</label>
            <input type="radio" id="contactChoice2"
            name="contact" value="service"  checked={businessType=== 'service'} onChange={handleOptionChange}/>
            <label >Service</label>
            <input type="radio" id="contactChoice3"
            name="contact" value="store"  checked={businessType=== 'store'} onChange={handleOptionChange}/>
            <label >Storefront</label>
          </div>
          
          <input
            type="text"
            name="animal"
            placeholder="Give The Business A Theme..."
            value={ideaThemelInput}
            onChange={(e) => setIdeaThemeInput(e.target.value)}
          />
          <button className={styles.twetchButton} onClick={generateIdea} value="Generate Idea" > Generate A Business Idea</button>
          <div className={styles.result}>{ideaResult}</div>
          <h3 style={{textAlign: "center", margin:"4px"}}>Then</h3>
          <button  className={styles.twetchButtonReverse} onClick={onSubmit} type="submit">Generate Business Plan</button>
          <div style={{"paddingTop":"12px"}}> 
          <button style={{"width": "45%", "marginRight":"5%"}} onClick={onSubmit} type="submit">Keep Going</button>
          <button style={{"width": "45%", "marginLeft":"5%"}} onClick={tryAgain} type="submit">Try Again</button>
          </div>
        </form>
        
        <div className={styles.result}>{result}</div>
        <h3 >Or Ask The AI To Create Something</h3>
        <div className="story" style={{"width":"100%"}}>
          <div> 
          <p style={{textAlign: "center", fontSize:"20px"}}>Tell it to create anything. You can say something like: Create a list of 5 reasons why X, write a crazy story about a unicorn in a bar, tell me a dad joke, summarize this for me... </p>
          <textarea
            style={{"width":"100%"}}
            rows="5"
            type="text"
            name="mainCharacter"
            placeholder="EXAMPLES: Create a list of reasons why X, write a crazy story about a unicorn in a bar, tell me a dad joke, explain this code  "
            value={storyIdeaInput}
            onChange={(e) => setStoryIdeaInput(e.target.value)}
          />
          </div>
          <div style={{"paddingTop":"12px"}}>
          {dataFinishReason === "stop" 
            ? ""
            : 
            <button style={{"width": "45%", "marginRight":"5%"}} onClick={generateStory} value="Generate Idea" >{(!storyIdeaResult || storyIdeaResult === "") ? "Let's GO!" : "Keep Going"}</button>
          }
            <button style={{"width": "45%", "marginLeft":"5%"}} onClick={clearStory} value="Generate Idea" >Start Over</button>
          </div>
          <div className={styles.result}>{storyIdeaResult}</div>
        </div>
      </main>
    </div>
  );
}
