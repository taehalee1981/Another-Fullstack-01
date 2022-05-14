const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

async function faz () {
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, 'views'));
    //console.log(path.resolve(__dirname, 'views'));
    
    //middleware = vai ser chamado todas as vezes
    app.use (bodyParser.urlencoded({ extended: true }));
    
    app.use(express.json());

    const auth = new google.auth.GoogleAuth({
        keyFile: "bugtracker.json", //the key file
        //url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets", 
    });
    
    const authClientObject = await auth.getClient();
    
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    // https://docs.google.com/spreadsheets/d/11J1Da50Zty5Db-FU5LFW37kcQbvvhZBL8qfklvQSACk/edit#gid=0
    
    const spreadsheetId = "11J1Da50Zty5Db-FU5LFW37kcQbvvhZBL8qfklvQSACk";

    //Read front the spreadsheet
    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: "Sheet1!A:A", //range of cells to read from.
    })
    //send the data reae with the response
    console.log(readData.data);


    app.get('/', (request, response) => {
        response.render('home');
    });
    
    app.post('/', (request, response) =>{
        //write data into the google sheets
         googleSheetsInstance.spreadsheets.values.append({
            auth, //auth object
            spreadsheetId, //spreadsheet id
            range: "Sheet1!A:F", //sheet name and range of cells
            valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: [[ 
                    request.body.name,
                    request.body.email,
                    request.body.issueType,
                    request.query.source || 'default',
                    request.body.userAgent,
                    request.body.userDate,
                ]],
            },
        });
        //response.send('Inserted successfully');
        response.render('success');
    })    
}

faz();
app.listen(3000);