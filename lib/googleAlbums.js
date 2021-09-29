// import { google } from 'googleapis';

export async function getAlbums() {

	const {google} = require('googleapis');
	// const Photos = require('googlephotos');

	// const oauth2Client = new google.auth.OAuth2('567200510462-t864be02p5that3a6jprpr010gu8goie.apps.googleusercontent.com', '5nxMqguswLVlcQxYdw8NHULL', 'http://localhost:4000/oauth2callback');

	// const scopes = [Photos.Scopes.READ_ONLY];

	// const url = oauth2Client.generateAuthUrl({
 //  		// 'online' (default) or 'offline' (gets refresh_token)
 //  		access_type: 'offline',

 //  		// If you only need one scope you can pass it as a string
 //  		scope: scopes,
	// });

	// // Send the user to the url from above. Once they grant access they will be redirected to the
	// // the redirect URL above with a query param code in the redirect. Use the code below to get the
	// // access token.
	// const {tokens} = await oauth2Client.getToken(code);
	// // The token from above can be used to initialize the photos library.

	return [];
}







// import { google } from 'googleapis';
// export async function getAlbums() {
//   try {
//     const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
//     const jwt = new google.auth.JWT(
//       process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
//       null,
//       (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
//       target
//     );

//     const sheets = google.sheets({ version: 'v4', auth: jwt });
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: process.env.SPREADSHEET_ID,
//       range: 'emoji', // sheet name
//     });

//     const rows = response.data.values;
//     if (rows.length) {
//       return rows.map((row) => ({
//         title: row[2],
//         subtitle: row[3],
//         code: row[4],
//         browser: row[5],
//         short_name: row[17],
//         emojipedia_slug: row[18],
//         descriptions: row[19],
//       }));
//     }
//   } catch (err) {
//     console.log(err);
//   }
//   return [];
// }