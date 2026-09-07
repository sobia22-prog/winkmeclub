const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    
    try {
        console.log(`Connecting to FTP host: ${process.env.FTP_SERVER}...`);
        await client.access({
            host: process.env.FTP_SERVER,
            user: process.env.FTP_USERNAME,
            password: process.env.FTP_PASSWORD,
            secure: false,
            port: 21
        });
        console.log("Connected to FTP server successfully!");

        console.log("Navigating to public_html directory...");
        await client.ensureDir("public_html");

        console.log("Clearing public_html directory...");
        await client.clearWorkingDir();

        const distPath = path.join(__dirname, "../../client/dist");
        console.log(`Uploading files from ${distPath} to public_html...`);
        await client.uploadFromDir(distPath);

        console.log("🎉 ALL FILES UPLOADED SUCCESSFULLY TO HOSTINGER public_html!");
    } catch (err) {
        console.error("❌ FTP Deployment Error:", err);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
