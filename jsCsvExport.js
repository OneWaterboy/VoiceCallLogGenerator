const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const directoryPath = path.join(/* Local Path to Google Voice Call Log needs to go here */);
const csvFilePath = path.join(/* Chosen Output path for local directory goes here' , 'GoogleVoiceCallLog.csv' */);

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    // Write the headers to the CSV file
    fs.writeFile(csvFilePath, 'Date,Time,Phone Number,Call Type,Caller Name,Call Duration\n', function(err) {
        if (err) {
            return console.log('Error writing to CSV file:', err);
        }
    });

    // Process each file
    files.forEach(function (file) {
        const filePath = path.join(directoryPath, file);
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                console.log('Error reading file:', err);
                return;
            }

            const dom = new JSDOM(data);
            const dateTime = dom.window.document.querySelector('.published');
            const callerNameElement  = dom.window.document.querySelector('span.fn');
            const linkElement = dom.window.document.querySelector('a.tel'); // select the a element with class tel
            const durationElement = dom.window.document.querySelector('.duration');

            if (dateTime && callerNameElement ) {
                let dateTimeParts = dateTime.innerHTML.split(',');
                if (dateTimeParts.length > 2) {
                    // Join the parts after the second comma back together
                    let afterSecondComma = dateTimeParts.slice(2).join(',');
                    dateTimeParts = dateTimeParts.slice(0, 2);
                    dateTimeParts.push(afterSecondComma);
                }

                //Get the Phone number that called or was dialed out to
                const hrefValue = linkElement.getAttribute('href'); // get the href value
                let phoneNumberArray = hrefValue.split('+');
                let phoneNumber = phoneNumberArray.length > 1 ? phoneNumberArray[1] : '';
                
                //Get the name of the contact that was called or dialed out to and the type of call it was
                let callerArray = callerNameElement.innerHTML.split(' ');
                let callerNamePartArray = callerArray[2] ? callerArray[2].split('\n') : ['',''];

                let callType = callerNamePartArray[0];
                let callerName = callerNamePartArray[1] && callerNamePartArray[1].trim() !== '' ? callerNamePartArray[1] : '';


                if (callerNamePartArray[1] && callerNamePartArray[1].trim() !== '') {
                    callerName = callerNamePartArray[1];
                }

                //Check to see if there is a call duration available
                let duration = 'Missed Call'; // Declare duration before the if statement

                if (durationElement && durationElement.innerHTML.trim() !== '') {
                    duration = durationElement.innerHTML.replace(/\(|\)/g, ''); // Remove parentheses
                    let durationParts = duration.split(':');
                    if (durationParts[durationParts.length - 1] === '00') {
                        duration = 'No answer';
                    }
                }

                // Create separate columns for each part of the call log
                const csvLine = `"${dateTimeParts[0]} ${dateTimeParts[1]}","${dateTimeParts[2]}",${phoneNumber}, ${callType},"${callerName}","${duration}"\n`;

                // Append the data to the CSV file
                fs.appendFile(csvFilePath, csvLine, function(err) {
                    if (err) {
                        console.log('Error writing to CSV file:', err);
                    }
                });
            }
        });
    });
});
