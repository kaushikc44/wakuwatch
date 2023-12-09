"use client"
import { createNode, sendVote } from "../waku";
import { useEffect, useState } from "react";

export interface IPollMessage {
    authorName: string;
    timestamp: number;
    article: string;
  }



export default  function Write(){
    const [article,setArticle] = useState<string>("")
    const [author,setAuthor] = useState<string>("")
    const [invalid,setInvalid] = useState<boolean>(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthor(e.target.value);
      };
    
      const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setArticle(e.target.value);
      };
    


    const sendArticle = async () =>{
        if(article.length < 0  && author.length < 0 ) {
          setInvalid(true);

      // Hide the error message after 3 seconds
          setTimeout(() => {
            setInvalid(false);
          }, 10000);

          return;
        }
        const node = await createNode();
        console.log("The node has been created",node)
        console.log("Creating the article");

        

        const value:IPollMessage = {
            authorName:author,
            timestamp: Date.now(),
            article:article


        }
        const sendArticle = sendVote(node,value );
        console.log("Article has been created");

    }

    return (
        <>
       
        <div className="flex flex-col justify-center items-center min-h-screen ">
        {invalid && (
          <div role="alert" className="alert alert-error top-0 left-0 bg-red">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error! Task failed successfully.</span>
          </div>
        )}
      <h1 className="text-2xl"> Writers DashBoard</h1>
      <div className="mt-10">
        <input
          type="text"
          placeholder="Enter the Author Name"
          className="input input-bordered input-primary  bg-graynew border-2 rounded mb-10 text-xl w-[300px] h-[70px] justify-center items-center"
          value={author}
          onChange={handleInputChange}
        />
      </div>

      {/* Textarea with state */}
      <textarea
        placeholder="Write your Article...."
        className="textarea textarea-border bg-graynew w-[1100px] h-[400px] text-xl border-2 rounded mb-5"
        value={article}
        onChange={handleTextareaChange}
      ></textarea>
      

      <button onClick={sendArticle} className="btn bg-graynew border-2 w-[200px] text-xl h-[50px] hover:bg-white hover:text-black rounded-2xl">Publish Articles</button>
   
    </div>

    
        </>
    )


}