const fs = require('fs')
const Axios = require('axios');
const nodemailer = require('nodemailer');
const gm = require('gm').subClass({ imageMagick: true });
const { v4: uuidv4 } = require('uuid');





// the main fucnction that will be exported and imported to server.js 
// on production i am going to fetch the Image URL from friebase DB 

const imageHandler = async (id, docid, email) => {
    console.log("image Handler is called...")

    const path = `images/${uuidv4()}Hdk7DvDRfhAzquE58nLw.jpg`;
    const imageUrl = 'https://s3-eu-west-3.amazonaws.com/yaso/feedboss/result/Hdk7DvDRfhAzquE58nLw_res.jpg'

    if (false) {
        return null;
    }
    else {

        let downloadI = await downloadImage(imageUrl, path); // download photo
        cropSizes().then(sizes => {
            newCropper(sizes, path, `images/${Date.now()}Hdk7DvDRfhAzquE58nLw_res_`)
                .then(r => emailImages(r, path, email));
        })

    }
}

const makeAttachArray = async (croppers) => {
    return new Promise((resolve, reject) => {
        let attachments = [];
        croppers.map(r => {
            attachments.push({ filename: r.substring(7), path: __dirname + '/' + r, cid: r.substring(7) })
        });
        resolve(attachments);
    });
}


const downloadImage = async (url, path) => {

    const writer = fs.createWriteStream(path)
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(writer))
        writer.on('error', reject)
    })
}

const clear = async (arr, baseImage) => {
    let baseInput = baseImage;
    arr.map(file => {
        fs.unlink(file, (err) => {
            if (err) {
                console.error(err)
                return;
            }
        })
    })
    fs.unlink(baseInput, (err) => {
        if (err) {
            console.log(err)
            return;
        }
    })
    return true
}

const newCropper = (sizes, originalImage, outputImage) => {
    return new Promise((resolve, reject) => {
        let attach = [];
        sizes.forEach(async (size, index) => {
            gm(originalImage)
                .crop(1080, 1080, size.width, size.height)
                .write(outputImage + index + '_.jpg', (err) => {
                    if (err) {
                        console.log("GM Error ", err)
                        reject(err);
                    }
                    else {
                        attach.push(outputImage + index + '_.jpg')
                        if (attach.length === sizes.length) return resolve(attach)
                    }
                });
        })
    })
}

const cropSizes = () => {
    return new Promise((resolve, reject) => {
        const h = 1080;
        const w = 1080;
        var width = 0;
        var height = 0;
        let sizes = []
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                sizes.push({ width: width, height: height })
                width = width + w
            }
            width = 0
            height = height + h;
        }
        return resolve(sizes)
    })

}

// const RunMagic = (originalImage)
// this function get an "attachment" array and send email
const emailImages = async (attach, baseImage, email) => {
    let arr = await makeAttachArray(attach);
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'youremail@example.com',
            pass: 'yourpassword'
        }
    });
    let info = transporter.sendMail({
        from: '"Shoukd work Team" <from@example.com>',
        to: email,  //DYNAMIC
        subject: "feedboss",
        attachments: arr, // function that make and attachment array 
        html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
    }, (error, inf) => {
        if (error) {
            return console.log(error);
        }
        else {
            clear(attach, baseImage);
        }
    });
}


// for testing
async function main() {
    const path = `images/1nvPF1r1Jn18AoWUcqnZ.jpg`;
    let downloadI = await downloadImage("https://s3-eu-west-3.amazonaws.com/yaso/feedboss/result/Hdk7DvDRfhAzquE58nLw_res.jpg", path);
    let croppers = await cropper(path, 'images/1nvPF1r1Jn18AoWUcqnZ_res_')
    let attachmentarray = await makeAttachArray(croppers);
    setTimeout(() => {
        console.log(attachmentarray);
    }, 4000);
}
// main()

module.exports = { imageHandler };
