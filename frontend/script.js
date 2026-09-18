const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const transcript = document.getElementById("transcript");
const lectureTitle = document.getElementById("lecturetitle");
const saveButton = document.getElementById("saveButton");
const exportButton = document.getElementById("exportButton");
const lectureHistory = document.getElementById("lectureHistory");
const searchInput = document.getElementById("searchInput");
const seeAll = document.getElementById("seeAll");


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "mn-MN";
recognition.continuous = true;
recognition.interimResults = true;

let sessionStartTime = null;
let sessionEndTime = null; 

function formatDateTime(date) {
    if( !date) return null ;
    return date.toISOString().slice(0, 19).replace("T", " ");
}

startButton.addEventListener("click",() => {
    sessionStartTime = new Date();

    console.log("Session started:", sessionStartTime);
    console.log("Lecture:", lectureTitle.value); 

    recognition.start();
});

stopButton.addEventListener("click",() => {
    sessionEndTime = new Date();

    console.log("Session stopped:", sessionEndTime);
    console.log("Lecture:", lectureTitle.value);
    recognition.stop();
});

// recognition.onresult = (event) => {
//     console.log(event.results);
// };


let finalTranscript = [];

recognition.onresult = (event) => {

    let interimTranscript = [];

    for(let i = event.resultIndex; i < event.results.length; i++){
        if(event.results[i].isFinal){

            const time = new Date().toLocaleTimeString();
            finalTranscript.push(`[${time}] ${event.results[i][0].transcript}`)

        }else{

            interimTranscript.push(event.results[i][0].transcript)

        }
        
    }
    console.log(finalTranscript + interimTranscript);

    const text = finalTranscript.join(" ") + " " + interimTranscript.join(" ");
    transcript.textContent = text;
};

saveButton.addEventListener("click",async () => {
    //const text = finalTranscript.join("\n");

    console.log("SAVING:");
    console.log("start: ", sessionStartTime);
    console.log("end: ", sessionEndTime);
    const session ={
        title: lectureTitle.value,
        start_time: formatDateTime(sessionStartTime),
        end_time: formatDateTime(sessionEndTime),
        transcript: finalTranscript.join("\n")
    };

    console.log("Session Object: ", session);
    const response = await fetch("/lectures", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(session)
    });

    const data = await response.json();
    console.log(data);
    //localStorage.setItem("navchTranscript", JSON.stringify(session));
    //console.log("Hadgalagdlaa", session);
});

exportButton.addEventListener("click", ()=> {
    const text = finalTranscript.join("\n");
    const blob = new Blob([text], { type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lectureTitle.value || "navch-transcript"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
});

async function loadLectures( search = " " ){
    const response = await fetch("/lectures");
    const lectures = await response.json();

    lectureHistory.innerHTML = "";

    const selectures = [];


    lectures.forEach(lecture => {
        // const item  = document.createElement("div");

        // item.innerHTML = `
        // <h3>${lecture.title}</h3>
        // <p>Started: ${lecture.start_time}</p>
        // <p>Ended: ${lecture.end_time || "Not finished"}</p>
        // <button>Open</button>
        // `;

        // item.querySelector("button").addEventListener("click", ()=>{
        //     transcript.textContent = lecture.transcript;
        // });
        // lectureHistory.appendChild(item);

        if(lecture.title == search){
            selectures.push(lecture);
        }

    });

    selectures.forEach( selecture => {
        const item  = document.createElement("div");

        item.innerHTML = `
        <h3>${selecture.title}</h3>
        <p>Started: ${selecture.start_time}</p>
        <p>Ended: ${selecture.end_time || "Not finished"}</p>
        <button>Open</button>
        `;

        item.querySelector("button").addEventListener("click", ()=>{
            transcript.textContent = selecture.transcript;
        });
        lectureHistory.appendChild(item);
    });

};

async function loadAllLectures(){
    const response = await fetch("/lectures");
    const lectures = await response.json();

    lectureHistory.innerHTML = "";

    lectures.forEach(lecture => {
        const item  = document.createElement("div");

        item.innerHTML = `
        <h3>${lecture.title}</h3>
        <p>Started: ${lecture.start_time}</p>
        <p>Ended: ${lecture.end_time || "Not finished"}</p>
        <button>Open</button>
        `;

        item.querySelector("button").addEventListener("click", ()=>{
            transcript.textContent = lecture.transcript;
        });
        lectureHistory.appendChild(item);


    });


};


seeAll.addEventListener("click", ()=> {
    loadAllLectures();
})
// 

searchInput.addEventListener("input", () => {
    loadLectures(searchInput.value);
});
