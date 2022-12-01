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
  const [loading, setLoading] = useState(false)
  
  useEffect(()=>{
    console.log({window})
    if ("bitcoin" in window) {
      console.log("Bitcoin is in the HOUSE!")
      const provider = window.bitcoin;
      if (provider.isTwetch) {
        setHasTwetchWallet(true);
        return provider;
      }
    }
    //window.open("https://twetch.com/downloads", "_blank");
  }, [])
  
  async function tryAgain(event){
    setResult("")
    await onSubmit(event);
  }
  function clearStory() {
    setStoryIdeaInput("");
  }
  async function onSubmit(event) {
    setLoading(true)
    event ? event.preventDefault():  console.log("no event");
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
      return;
    }
    console.log(paymentResponse.actionId)
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
    try {
      const resp = await window.bitcoin.connect();
      console.log(resp.publicKey.toString())
      console.log(resp.paymail.toString())
      
    } catch (err) {
      alert(err);
      return;
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
      return;
    }
    console.log(paymentResponse.actionId)
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
      return;
    }
    console.log(paymentResponse.actionId)
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
    setLoading(false)
  }
  function handleOptionChange(changeEvent) {
    setBusinessType(changeEvent.target.value);
  }
  
  return (
    <div>
    <div> 
    {
      hasTwechWallet ? "" : <a className={styles.twetchButton} href="https://twetch.com/downloads" target="_blank" > Get Twetch Wallet</a>
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
            <button style={{"width": "45%", "marginRight":"5%"}} onClick={generateStory} value="Generate Idea" >{(!storyIdeaResult || storyIdeaResult === "") ? "Let's GO!" : "Keep Going"}</button>
            <button style={{"width": "45%", "marginRight":"5%"}} onClick={clearStory} value="Generate Idea" >Start Over</button>
          </div>
          <div className={styles.result}>{storyIdeaResult}</div>
        </div>
      </main>
    </div>
  );
}
