import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const getZillowData = async (req, res) => {
    try{
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.zillowAPIKEY
            }
        }

        console.log(process.env.zillowAPIKEY)
        const response = await fetch('https://api.hasdata.com/scrape/zillow/listing?keyword=New%20York%2C%20NY&type=forRent', options)
        const data = await response.json()

        console.log(data)
        res.status(200).json(data)
    }
    catch(err){
        res.status(409).json({error: err.message})
    }
}

export default {getZillowData}