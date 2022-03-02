# WebRTC Project
WebRTC Project is a web video chat application that uses WebRTC to provide real-time communication capabilities. WebRTC Project includes two screens the Join and the main screen.
## Join Screen
Here you have two options to create a call or to join an existing call. To create a call you have to type your name and press the 'Create Call' button. To join an existing call you have to type your name, type the room code and press the 'Join Call' button.
![Join Screen](/README_assets/login.png "Join Screen")
## Main Screen
When you join or create a call you redirect to the Main Screen. This screen has the following functionalities:  
1. Mute/Unmute Audio
2. Mute/Unmute video
3. Leave the Call
4. Send a Message to Chat
5. See Participants List
6. See Uploaded files
7. Upload a file to the server
![Main Screen](/README_assets/main.png "Main Screen")
## More about this project
The WebRTC Project can run on localhost or online. To run online the project you have to download ngrok. Ngrok is used to expose your localhost to the web. To download ngrok click **[here](https://ngrok.com/download)**.
## Libraries-frameworks that used in this project
* WEB-RTC
* node.js
* Express
* fetch api
* socket io
* uuidv4
* ExpreessPeerServer
* express-fileupload
## How to run the Project
First you need to open project and type `npm install` to install all the necessary libraries and then type `npm run dev` to run the server.