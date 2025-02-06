
const requestForm = document.getElementById('requestForm');
const outputDiv = document.getElementById('outputDiv');
let conversationHistory = "";

requestForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value;

    const userMessage = document.createElement('div');
    userMessage.innerHTML = prompt;
    outputDiv.appendChild(userMessage);
    Array.from(prompt).forEach(character=>{
	conversationHistory += character;
    });

    // Send the request to Ollama
    fetch(`http://localhost:11434/api/generate`, {method: "POST",body: JSON.stringify({
        "model": "deepseek-r1:7b", //any models pulled from Ollama can be replaced here
        "prompt": `${conversationHistory}` //The prompt should be written here
      }),
    
    // Adding headers to the request
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }})
        .then(response => {
            
            console.log(response)
            return response.text()
        })
        .then(output => {
            raw_data = output
            let json_objects = raw_data.trim().split("}")
            json_objects = json_objects.map((obj)=>{
                if(obj.length > 1 && obj[obj.length-1]=="}") {
                    return obj
                }
                else if (obj == "}") {
                    return ""
                } else if (obj == "") {
                    return "{}"
                } else {
                    return obj + "}"
                }
            })
            
            let responses = Array();
            let final_object;
	    let messageHistoryResponse = Array();
	    let appIsThinking = false;
            json_objects.forEach((obj)=>{
                try {
                    // console.log(obj);
                    
                    let data = JSON.parse(obj);
                    
                    // Collect 'response' values

                    console.log('data:',data)
                    console.log('response:', data.response)
                    if (data.response) {
                        let tag_parsed_data = data.response

                        if(data.response == "<think>") {
                            tag_parsed_data = "<strong>&lt;think&gt;</strong><br>"
			                appIsThinking = true;
                        }
                        else if(data.response == "</think>") {
                            tag_parsed_data = "<strong>&lt;&#47;think&gt;</strong><br>"
			                appIsThinking = false;
                        }
                        responses.push(tag_parsed_data);
                        if (!appIsThinking && data.response != "</think>") {
                            messageHistoryResponse.push(data.response) 
                        }
                    }
                    
                    // Check if this is the final "done: true" object
                    if (data.done === true) {
                        final_object = data;
			messageHistoryResponse.forEach(character=>{
			     conversationHistory += character;
			});
                    }
                }
                catch (e) {
                    console.error(`Error parsing JSON object`, e)
                }

            })

            
                

            // Combine the responses into a full message
            let full_message = responses.join("").trim();
            console.log("Full Message:", full_message);
            if (final_object) {
                console.log("Final Object:", final_object);
            }

            output = full_message;
	    const newOutput = document.createElement("div")
	    outputDiv.appendChild(newOutput)
            newOutput.innerHTML = output;
        });
});

// Initialize page with empty form and empty results
document.getElementById('requestForm').addEventListener('click', function() {
    requestForm.click();
});

document.getElementById('outputDiv').innerHTML = '';
